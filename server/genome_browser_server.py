from http.server import HTTPServer, BaseHTTPRequestHandler
from http import HTTPStatus
import json
import sys
import time
import traceback
from ctypes import *
import gzip
from typing import Mapping

root_data = {}
dbSNFP_fields_start = 12 # from 12th column (field) will be score value (e.g. AF) 
dbSNFP_fields_num = 12
default_ref = "hg38"

limit_size = 200
letters = "ATGCN"

clib = cdll.LoadLibrary('./libclib.so')

class RefGenome(object):
    def __init__(self, filename):
        self.obj = clib.create_RefGenome_instance(filename.encode("utf-8"))

    def get_headers(self):
        p = (c_char_p * 10000)()
        clib.ref_get_headers(self.obj, p)
        b = bytearray(p).decode()
        i = 0
        while ((i < len(b)) and (b[i] != '#')): i += 1
        s = b[0:i]
        return s.split()

        # clib.ref_get_headers(self.obj).decode("utf-8")
        # return s.split(" ")
    
    def get_detail_seq(self, id, pos, size):
        p = (c_char_p * size)()
        clib.ref_get_seq(self.obj, id, pos, size, p)
        b = bytearray(p)
        s = b.decode()
        if (len(s) > size): s = s[0:size]
        return s
    
    def get_char_count_cumm(self, id, pos):
        p = (c_int * 5)()
        clib.get_char_count_cumm(self.obj, id, pos, p)
        return list(p)
    
    def get_char_count_series(self, id, pos, step, size):
        tsize = 5 * size
        p = (c_int * tsize)()
        clib.get_char_count_series(self.obj, id, pos, step, size, p)
        b = list(p)
        j = 0
        a = []
        for i in range(0, size):
            s = [0] * 5
            for r in range(0, 5): s[r] = b[j+r]
            a.append(s)
            j += 5

        # print("series return = ", a)
        return a
        
class SNFP_DB(object):
    def __init__(self, num_af, start_af, filename):
        self.obj = clib.create_SNFP_DB_instance(start_af, filename.encode("utf-8"))
        self.num_af = num_af

    def get_range_summary(self, id, begin, end):
        # print("num_af", self.num_af)
        tsize = self.num_af * 100
        tsize2 = tsize * 2
        pi = (c_int * tsize)()
        pf = (c_float * tsize2)()
        clib.db_SNFP_calc_range_summary(self.obj, id, begin, end, pi, pf)
        i_res = list(pi)
        f_res = list(pf)
        si = self.num_af
        sf = 0
        res = []
        for i in range(0, self.num_af):
            rlist = []
            n = i_res[i]
            for j in range(0, n):
                rlist.append([f_res[sf], f_res[sf+1], i_res[si]])
                si += 1
                sf += 2
            res.append(rlist)
        return res

def get_param_by_name(path, name, default_value):
    p = path.find(name + "=")
    if (p < 0): return default_value
    i = p
    while ((path[i] != '=')): i += 1
    i += 1
    p = i
    while ((i < len(path)) and (path[i] != '&')): i += 1
    return path[p:i]


def get_region(path):
    p = path.find("region=")
    if (p < 0): return ["chr1", 10000, 10200]
    while (path[p] != '='): p += 1
    p += 1
    i = p
    while (path[i] != ':'): i += 1
    header = path[p:i]
    i += 1
    p = i
    while (path[i] != '-'): i += 1
    pos1 = int(path[p:i])
    i += 1
    p = i
    while ((i < len(path)) and (path[i] != '&')): i += 1
    pos2 = int(path[p:i])
    print(path, header, pos1, pos2)
    return [header, pos1, pos2]

def extract_gencode_simple(data, pos, step, size):
    picked_trans = {}
    for trans in data:
        start = (trans["startPos"] - pos) // step
        end = (trans["endPos"] - pos) // step
        if (start >= size): continue
        if (end < 0): continue
        if (start < 0): start = 0
        if (end >= size): end = size
        loc_id = end * (size + 1) + start
        if loc_id in picked_trans: 
            picked_trans[loc_id].append(trans)
        else:
            picked_trans[loc_id] = [trans]
    out1 = []
    out2 = []
    for loc_id in picked_trans.keys():
        tlist = picked_trans[loc_id]
        if (len(tlist) < 1000): out1.extend(tlist)
        start = loc_id % (size + 1)
        end = loc_id // (size + 1)
        # print(loc_id, size, start, end)
        start = pos + start * step
        end = pos + end * step
        out2.append([start, end, len(tlist)])
    if (len(out1) < limit_size): return { "type": "details", "data": out1 }
    return { "type": "summary", "data": out2 }

def binary_search_SNFP(data, pos, begin, end):
    while (begin < end):
        mid = (begin + end) // 2
        if (data[mid][1] < pos):
            begin = mid+1
        else:
            end = mid
    return begin

# Determine the list positions that belong to each interval
def get_SNFP_position(data, pos, step, size):
    list_pos = [0] * (size + 1)
    begin = binary_search_SNFP(data, pos, 0, len(data))
    end = binary_search_SNFP(data, pos + step*size, list_pos[0], len(data))
    list_pos[0] = begin
    list_pos[size] = end
    for i in range(1, size):
        pos += step
        begin = binary_search_SNFP(data, pos, begin, end)
        list_pos[i] = begin
    return list_pos

def extract_SNFP_simple(snfp_db, data, id, pos, step, size):
    list_pos = get_SNFP_position(data, pos, step, size)
    out1 = []
    out2 = []
    for i in range(size):
        n = list_pos[i+1] - list_pos[i]
        if (n == 0): continue
        if (n < 5):
            for j in range(list_pos[i], list_pos[i+1]):
                tokens = data[j][0].split("\t")
                tokens[1] = data[j][1]
                out1.append(tokens)
        else:
            res = snfp_db.get_range_summary(id, list_pos[i], list_pos[i+1])
            n = 0
            for r in res: n += len(r)
            if (n > 0): out2.append([pos + i*step, res])
    return {"details": out1, "summary": out2}

def process_data_request_impl(path):
    # print(path)
    params = get_region(path)
    ref_id = get_param_by_name(path, "ref", default_ref)
    main_data = root_data[ref_id]
    ref = main_data["ref"]
    snfp_db = main_data["snfp_db"]
    header = params[0]
    pos1 = params[1]-1
    pos2 = params[2]-1
    chr_data = main_data["data"][header]
    seq_len = chr_data["size"]
    id = chr_data["id"]
    if (pos1 < 0): pos1 = 0
    if (pos2 > seq_len): pos2 = seq_len
    size = pos2 - pos1
    if (size <= 0): return {}
    start = time.time()
    if (size <= limit_size): # when window size is small enough to show details
        n = size
        interval = 1
        ref_seq = ref.get_detail_seq(id, pos1, size)
    else: # Now consider the case viewing window size is large enough, we cannot show all details
        interval = (size + limit_size - 1) // limit_size
        n = (size + interval - 1) // interval
        size = n * interval
        ref_seq = ref.get_char_count_series(id, pos1, interval, n),
    t_ref = time.time() - start
    start = time.time()
    gene_data = extract_gencode_simple(chr_data["gencode"], pos1, interval, n)
    t_gene = time.time() - start
    start = time.time()
    snp_data = extract_SNFP_simple(snfp_db, chr_data["dbSNFP"], chr_data["dbSNFP_index"], pos1, interval, n)
    t_snp = time.time() - start
    t_ref = round(t_ref, 3)
    t_gene = round(t_gene, 3)
    t_snp = round(t_snp, 3)
    print("Interval", interval, "n=", n, "ref_seq time", t_ref, "gene time", t_gene, "snp time", t_snp)
    return {
            "ref_id": ref_id,
            "header": header,
            "pos": pos1+1,
            "interval": interval,
            "size": n,
            "ref": ref_seq,
            "gencode": gene_data,
            "snp": snp_data
        }
    

def process_data_request(path):
    try:
        return process_data_request_impl(path)
    except Exception as e:
        print(e)
        traceback.print_exc()
        return {}

def process_search_keyword_request(path):
    try:
        ref_id = get_param_by_name(path, "ref", default_ref)
        keyword = get_param_by_name(path, "keyword", "")
        if (keyword == ""): return {}

        keyword_db = root_data[ref_id]["keyword_db"]

        if not (keyword in keyword_db): return {}

        kd = keyword_db[keyword]
        begin = kd[1]
        end = kd[2]+1
        if (end - begin < limit_size):
            ext = (limit_size - (end - begin)) // 2
            begin = begin - ext
            end = end + ext
        xpath = "ref=" + ref_id + "&region=" + kd[0] + ":" + str(begin) + "-" + str(end)
        data = process_data_request_impl(xpath)
        data["highlight"] = [kd[1], kd[2]]
        return data
    except Exception as e:
        print(e)
        traceback.print_exc()
        return {}

def get_headers(path):
    try:
        ref_id = get_param_by_name(path, "ref", default_ref)
        data = root_data[ref_id]["data"]
        res = []
        for key in data.keys(): res.append([key, data[key]["size"]])
        return res
    except Exception as e:
        print(e)
        traceback.print_exc()
        return []

def get_dbNSFP_fields(path):
    try:
        ref_id = get_param_by_name(path, "ref", default_ref)
        res = root_data[ref_id]["dbSNFP_fields"]
        return res
    except Exception as e:
        print(e)
        traceback.print_exc()
        return []

class _RequestHandler(BaseHTTPRequestHandler):
    # Borrowing from https://gist.github.com/nitaku/10d0662536f37a087e1b
    def _set_headers(self):
        self.send_response(HTTPStatus.OK.value)
        self.send_header('Content-type', 'application/json')
        # Allow requests from any origin, so CORS policies don't
        # prevent local development.
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def _set_400(self):
        self.send_response(400)
        self.send_header('Content-type', 'application/json')
        # Allow requests from any origin, so CORS policies don't
        # prevent local development.
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_GET(self):
        self.do_GET_impl()
        sys.stdout.flush()
        sys.stderr.flush()

    def do_GET_impl(self):
        # print(self.path)

        # GET region
        if self.path.find("/api?region") >= 0:
            start = time.time()
            res = process_data_request(self.path)
            self._set_headers()
            out_data = json.dumps(res).encode('utf-8')
            self.wfile.write(out_data)
            print("Return data size =", len(out_data), "total time = ", round(time.time() - start, 3))

        # GET refs
        elif self.path.find("/api?refs") >= 0:
            self._set_headers()
            res = []
            for key in root_data.keys(): res.append(key)
            if len(res) == 0:
                self._set_400()
                return
            print("Headers", res)
            self.wfile.write(json.dumps({"refs": res}).encode('utf-8'))
        
        # GET headers
        elif self.path.find("/api?headers") >= 0:
            self._set_headers()
            res = get_headers(self.path)
            if len(res) == 0:
                self._set_400()
                return
            print("Headers", res)
            self.wfile.write(json.dumps({"headers": res}).encode('utf-8'))

        # GET SNFP fields
        elif self.path.find("/api?dbSNFP_fields") >= 0:
            self._set_headers()
            res = get_dbNSFP_fields(self.path)
            print(res)
            if len(res) == 0:
                self._set_400()
                return
            print("dbSNFP_fields", res)
            self.wfile.write(json.dumps({"dbSNFP_fields": res}).encode('utf-8'))
        
        # GET region by keyword
        elif self.path.find("/api?keyword") >= 0:
            start = time.time()
            res = process_search_keyword_request(self.path)
            self._set_headers()
            out_data = json.dumps(res).encode('utf-8')
            self.wfile.write(out_data)
            print(self.path, "return size =", len(out_data), "total time =", round(time.time() - start, 3))

        
        

def run_server(port):
    server_address = ('', port)
    httpd = HTTPServer(server_address, _RequestHandler)
    print("API is ready at port", port, flush=True)
    httpd.serve_forever()

def update_ref_headers(ref, data):
    hlist = ref.get_headers()
    i = 0
    id = 0
    while (i + 1 < len(hlist)):
        header = hlist[i]
        size = int(hlist[i+1])
        data[header] = {"id" : id, "size" : size}
        id += 1
        i += 2
    

def load_genecode_data(filename, data):
    print("Loading gene data from", filename)
    f = open(filename, encoding = 'utf-8')
    transcripts = []
    prev_chr_name = ""
    prev_transcript_id = ""
    prev_gene_id = ""
    exons = []
    transcript_index = 0

    for line in f:
        if ((line == "") or (line[0] == "#")): continue # ignore the #line
        elements = line.split()
        current_chr_name = elements[0]
        type = elements[2]
        startPos = int(elements[3])
        endPos = int(elements[4])
        direction = elements[6]
        description = elements[8]
        if (current_chr_name != prev_chr_name):
            prev_chr_name = current_chr_name
            if (current_chr_name in data.keys()):
                if ("gencode" in data[current_chr_name].keys()):
                    transcripts = data[current_chr_name]["gencode"]
                else:
                    transcripts = []
                    data[current_chr_name]["gencode"] = transcripts
            else:
                transcripts = []
            prev_transcript_id = ""
            prev_gene_id = ""
            exons = []
            
        
        if type == 'transcript':
            # get current_transcript_id
            current_transcript_id = description[description.index('ID=')+3: description.index(';')]

            # get gene_id
            tempStr = description[description.index('gene_id')+8: -1]
            gene_id = tempStr[: tempStr.index(';')]

            if (prev_transcript_id != current_transcript_id):
                if prev_gene_id != gene_id:
                    transcript_index = 0
                    prev_gene_id = gene_id
                else:
                    transcript_index += 1
                exons = []
                transcripts.append({
                    "trans_id": current_transcript_id,
                    "transcript_index": transcript_index,
                    "gene_id": gene_id,
                    "direction": direction,
                    "startPos": startPos,
                    "endPos": endPos,
                    "exons": exons 
                })
                prev_transcript_id = current_transcript_id
                
            
        # insert exon
        elif type == 'exon':
            # if same id as transcript
            exons.append({
                "startPos": startPos,
                "endPos": endPos
            })
    f.close()        
    for header in data.keys(): 
        if ("gencode" in data[header].keys()): print(header, len(data[header]["gencode"]))
    print("DONE", flush=True)

def load_dbSNFP(filename, data, dbSNFP_fields):
    print("Loading", filename)
    prev_header = ""
    first_line = True
    id = 0
    with gzip.open(filename,'r') as fin:
        for lineb in fin:
            line = lineb.decode()[:-1]
            tokens = line.split("\t")
            if (len(tokens) < 5): continue
            if (first_line):
                first_line = False
                dbSNFP_fields.extend(tokens)
                continue
            header = "chr" + tokens[0]
            if (header != prev_header):
                list_vars = []
                data[header]["dbSNFP"] = list_vars
                data[header]["dbSNFP_index"] = id
                id += 1
                prev_header = header
            # var = tokens
            # var[1] = int(tokens[1])
            var = [line, int(tokens[1])]
            list_vars.append(var)
    print(dbSNFP_fields)
    print("DONE")

def update_keyword_db(data, keyword, chr, start, end):
    if not (keyword in data):
        data[keyword] = [chr, start, end]
        return
    kd = data[keyword]
    # if (kd[0] != chr): print("ERROR: Different chromosome", keyword, kd, [chr, start, end])
    if (kd[0] != chr): return
    if (kd[1] > start): kd[1] = start
    if (kd[2] < end): kd[2] = end

def update_SNFP_keyword(data, keys, chr, pos):
    if (keys == "."): return
    for keyword in keys.split(";"): update_keyword_db(data, keyword, chr, pos, pos)

def build_search_keywords_database(data):
    keyword_db = {}
    print("Building keyword search database")
    for chr in data.keys():
        cdata = data[chr]
        if ("gencode" in cdata):
            for trans in cdata["gencode"]: 
                update_keyword_db(keyword_db, trans["trans_id"], chr, trans["startPos"], trans["endPos"])
                update_keyword_db(keyword_db, trans["gene_id"], chr, trans["startPos"], trans["endPos"])
        if ("dbSNFP" in cdata):
            for record in cdata["dbSNFP"]:
                var = record[0].split("\t")
                var[1] = record[1]
                update_SNFP_keyword(keyword_db, var[4], chr, var[1])
                update_SNFP_keyword(keyword_db, var[9], chr, var[1])
                update_SNFP_keyword(keyword_db, var[10], chr, var[1])
                update_SNFP_keyword(keyword_db, var[11], chr, var[1])
    print("DONE")
    return keyword_db

def load_data_by_ref(ref_genome_file, gencode_file, dbSNFP_file):
    ref = RefGenome(ref_genome_file)
    data = {}
    dbSNFP_fields = []
    update_ref_headers(ref, data)
    load_genecode_data(gencode_file, data)
    load_dbSNFP(dbSNFP_file, data, dbSNFP_fields)
    return { "ref": ref, 
            "data": data, 
            "snfp_db": SNFP_DB(dbSNFP_fields_start, dbSNFP_fields_num, dbSNFP_file),
            "keyword_db": build_search_keywords_database(data),
            "dbSNFP_fields": dbSNFP_fields
            }

if __name__ == '__main__':
    root_data["hg38"] = load_data_by_ref("hg38/Homo_sapiens_assembly38.fasta", "hg38/gencode.v38.annotation.gff3", "hg38/filtered_dbNSFP4.0_hg38.gz")
    root_data["hg19"] = load_data_by_ref("hg19/Homo_sapiens_assembly19.fasta", "hg19/gencode.v38.annotation_hg19.gff3", "hg19/filtered_dbNSFP4.0_hg19.gz")
    
    run_server(8000)

    # db = SNFP_DB(12, 12, "filtered_dbNSFP4.0.gz")
    # db.get_range_summary(0, 0, 10)
    # db.get_range_summary(0, 10, 20)
    #load_data(sys.argv[1])
    #run_server(int(sys.argv[2]))

