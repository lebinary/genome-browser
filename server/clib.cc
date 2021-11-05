#include <iostream>
#include <fstream>
#include <vector>
#include <ctype.h>
#include <map>
#include "stdlib.h"
#include <zlib.h>
#include <algorithm>
#include <sstream>
#include <cmath>
#include <math.h>

using namespace std;

#include "gz_utils.hh"

#define GEN_SIZE 3300000000
#define CHECKPOINT_DIST 20
#define AF_RANGE_DIST 0.2

const char *nbases = "ATGCN";

struct CharCountCheckpoint
{
private:
    int * ck_base_256[4];
    u_int8_t * ck_base_16[4];
    u_char *seq;
    int size;

public:
    CharCountCheckpoint(u_char *_seq, int _size)
    {
        seq = _seq;
        size = _size;
        for (int i = 0; i < 4; ++i) ck_base_256[i] = new int[(size / 256) + 2];
        for (int i = 0; i < 4; ++i) ck_base_16[i] = new u_int8_t[(size / 16) + 2];
        int index_256 = 0;
        int index_16 = 0;
        for (int i = 0; i < 4; ++i) ck_base_256[i][0] = 0;
        for (int j = 0; j < size; ++j)
        {
            if ((j & 15) == 0)
            {
                if ((j & 255) == 0)
                {
                    for (int i = 0; i < 4; ++i) ck_base_16[i][index_16] = 0;
                    for (int i = 0; i < 4; ++i) ck_base_256[i][index_256 + 1] = ck_base_256[i][index_256];
                    index_256++;
                }
                for (int i = 0; i < 4; ++i) ck_base_16[i][index_16+1] = ck_base_16[i][index_16];
                index_16++;
            }
            u_char c = seq[j];
            if (c >= 4) continue;
            ++ck_base_256[c][index_256];
            ++ck_base_16[c][index_16];
        }
    }

    void get_char_count_cumm(int pos, int * out) // count number of occurences up to pos
    {
        if (pos > size) pos = size;
        int p256 = pos >> 8;
        int p16 = pos >> 4;
        for (int i = 0; i < 4; ++i) out[i] = ck_base_256[i][p256] + ck_base_16[i][p16];
        int p_ck = p16 << 4;
        out[4] = p_ck;
        for (int i = 0; i < 4; ++i) out[4] -= out[i];
        for (int i = p_ck; i < pos; ++i) out[seq[i]]++;
    }
};

struct RefGenome
{
private:
    u_char *gdata;
    uint gsize;
    vector<uint> contig_pos;
    vector<string> headers;
    map<string, int> c_map;

    vector<CharCountCheckpoint> char_count_checkpoints;
    u_char char_map[256];

    void build_char_map()
    {
        for (int i = 0; i < 256; ++i) char_map[i] = 4;
        for (int i = 0; i < 4; ++i) char_map[nbases[i]] = i;
        for (int i = 0; i < 4; ++i) char_map[tolower(nbases[i])] = i;
    }

    u_char get_char_code(char c)
    {
        c = toupper(c);
        for (int i = 0; i < 4; ++i) 
            if (c == nbases[i]) return i;
        return 4;
    }

    void build_check_points()
    {
        int n = contig_pos.size() - 1;
        char_count_checkpoints.clear();
        for (int i = 0; i < n; ++i)
        {
            int size = contig_pos[i+1] - contig_pos[i];
            u_char *seq = gdata + contig_pos[i];
            char_count_checkpoints.push_back(CharCountCheckpoint(seq, size));
        }
    }
public:
    RefGenome(const char * filename)
    {
        cout << "Loading reference genome from " << filename << endl;
        ifstream fi(filename);
        string line;
        gsize = 0;
        contig_pos.clear();
        gdata = new u_char[GEN_SIZE];
        string header = "";
        uint pos;
        build_char_map();
        while (fi.good())
        {
            getline(fi, line);
            if (line.length() == 0) continue;
            if (line[0] == '>') 
            {
                if (header != "") cout << header << " " << gsize - contig_pos[contig_pos.size() - 1] << endl;
                if (header == "chrM") break;
                int p = 0;
                while ((p < line.length()) && (line[p] != ' ') && (line[p] != '\t')) ++p;
                header = line.substr(1, p-1);
                if ((header.length() < 4) || (header.substr(0, 3) != "chr")) header = "chr" + header;
                if (header == "chrMT") header = "chrM";
                c_map[header] = contig_pos.size();
                contig_pos.push_back(gsize);
                headers.push_back(header);
                pos = gsize;
                continue;
            }
            // for (int i = 0; i < line.length(); ++i) gdata[gsize++] = get_char_code(line[i]);
            for (int i = 0; i < line.length(); ++i) gdata[gsize++] = char_map[line[i]];
        }
        fi.close();
        contig_pos.push_back(gsize);
        cout << "gen size = " << gsize << " number of all contigs = " << contig_pos.size() << endl;
        build_check_points();
        cout << "Build checkpoints OK" << endl;
        // for (int i = 0; i < headers.size(); ++i) cout << headers[i] << " " << contig_pos[i+1] - contig_pos[i] << endl;
    }

    void get_char_count_cumm(int id, int pos, int *out)
    {
        char_count_checkpoints[id].get_char_count_cumm(pos, out);
    }

    void get_char_count_series(int id, int pos, int step, int size, int *out)
    {
        int cur[5];
        int next[5];
        int p = 0;
        CharCountCheckpoint &ckp = char_count_checkpoints[id];
        ckp.get_char_count_cumm(pos, cur);
        for (int i = 0; i < size; ++i)
        {
            pos += step;
            ckp.get_char_count_cumm(pos, next);
            for (int j = 0; j < 5; ++j) out[p++] = next[j] - cur[j];
            for (int j = 0; j < 5; ++j) cur[j] = next[j];
        }
    }

    void get_detail_seq(int id, int pos, int size, char *a)
    {
        u_char *s = (gdata + contig_pos[id] + pos);
        for (int i = 0; i < size; ++i) a[i] = nbases[s[i]];
        // cout << "Out = "; for (int i = 0; i < size; ++i) cout << a[i]; cout << endl;
    }

    string get_headers(char *out)
    {
        string s = "";
        for (int i = 0; i < headers.size(); ++i)
        {
            if (i > 0) s = s + " ";
            s = s + headers[i] + " " + to_string(contig_pos[i+1] - contig_pos[i]);
        }
        for (int i = 0; i < s.length(); ++i) out[i] = s[i];
        out[s.length()] = '#';
        return s;
    }
};


void tokenize(string &s, vector<string> &tokens, char delim = '\t')
{
    tokens.clear();
    int prev = -1;
    for (int i = 0; i <= s.length(); ++i)
    {
        if ((i == s.length()) || (s[i] == delim))
        {
            int tl = i - prev - 1;
            if (tl > 0) tokens.push_back(s.substr(prev+1, tl));
            prev = i;
        }
    }
}

struct RangeSummary
{
    float low, high;
    int count;
    
    RangeSummary() {}

    RangeSummary(float _low, float _high, int _count)
    {
        low = _low;
        high = _high;
        count = _count;
    }
};

struct SNFP_Block
{
public:
    void alloc_size(int _num_fields, int init_size)
    {
        num_fields = _num_fields;
        values.resize(num_fields);
        for (int i = 0; i < num_fields; ++i) values[i].resize(init_size);
        for (int i = 0; i < num_fields; ++i) values[i].clear();
        pos.resize(init_size);
        pos.clear();
    }

    void add_variant(int p, vector<float> &vals)
    {
        pos.push_back(p);
        for (int i = 0; i < num_fields; ++i) values[i].push_back(vals[i]);
    }

    int get_size()
    {
        return pos.size();
    }

    void build_tree()
    {
        int size = pos.size();
        if (size == 0) return;
        size2 = 1;
        while (size2 < size) size2 *= 2;
        node_begin.resize(num_fields);
        node_end.resize(num_fields);
        for (int i = 0; i < num_fields; ++i) node_begin[i].resize(2*size2);
        for (int i = 0; i < num_fields; ++i) node_end[i].resize(2*size2);
        int est_list_size = num_fields * size;
        ranges.resize(est_list_size);
        ranges.clear();
        build_tree_node(0, size, 0);
        // cout << size << endl;
    }

    void find_ranges(int fi, int begin, int end, vector<RangeSummary> &result)
    {
        result.clear();
        add_ranges_node(fi, begin, end, 0, pos.size(), 0, result);
        sort(result.begin(), result.end(), [] (const RangeSummary &a, const RangeSummary &b) { return a.low < b.low; } );
        int size = result.size();
        int i = 0;
        int n = 0;
        while (i < size)
        {
            RangeSummary r = result[i];
            ++i;
            while ((i < size) && (result[i].low < r.high + AF_RANGE_DIST))
            {
                r.count += result[i].count;
                if (r.high < result[i].high) r.high = result[i].high;
                ++i;
            }
            result[n++] = r;
        }
        result.resize(n);
    }


private:
    bool move_next(int &i, int size, float &h, int &c)
    {
        bool flag = false;
        while ((i < size) && (ranges[i].low < h + AF_RANGE_DIST))
        {
            c += ranges[i].count;
            if (h < ranges[i].high) h = ranges[i].high;
            i++;
            flag = true;
        }
        return flag;
    }

    void join_two_range_sets(int i1, int s1, int i2, int s2)
    {
        while ((i1 < s1) || (i2 < s2))
        {
            float l = 100, h;
            if (i1 < s1) 
            {
                l = ranges[i1].low;
                h = ranges[i1].high;
            }
            if ((i2 < s2) && (l > ranges[i2].low))
            {
                l = ranges[i2].low;
                h = ranges[i2].high;
            }
            int c = 0;
            while (true)
            {
                bool stop = true;
                if (move_next(i1, s1, h, c)) stop = false;
                if (move_next(i2, s2, h, c)) stop = false;
                if (stop) break;
            }
            ranges.push_back(RangeSummary(l, h, c));
        }
    }

    void build_tree_node(int left, int right, int id)
    {
        if (left+1 == right)
        {
            for (int i = 0; i < num_fields; ++i)
            {
                if (isfinite(values[i][left]))
                {
                    node_begin[i][id] = ranges.size();
                    ranges.push_back(RangeSummary(values[i][left], values[i][left], 1));
                    node_end[i][id] = ranges.size();
                } else
                {
                    node_begin[i][id] = 0;
                    node_end[i][id] = 0;
                }
            }
            return;
        }
        int mid = (left + right) / 2;
        build_tree_node(left, mid, 2*id+1);
        build_tree_node(mid, right, 2*id+2);
        for (int i = 0; i < num_fields; ++i)
        {
            node_begin[i][id] = ranges.size();
            join_two_range_sets(node_begin[i][2*id+1], node_end[i][2*id+1], node_begin[i][2*id+2], node_end[i][2*id+2]);
            node_end[i][id] = ranges.size();
        }
    }

    void add_ranges_node(int fi, int begin, int end, int left, int right, int id, vector<RangeSummary> &result)
    {
        // cout << begin << " " << end << " " << left << " " << right << " " << id << endl;
        if ((begin <= left) && (right <= end))
        {
            for (int i = node_begin[fi][id]; i < node_end[fi][id]; ++i) result.push_back(ranges[i]);
            return;
        }
        int mid = (left + right) / 2;
        if (begin < mid) add_ranges_node(fi, begin, end, left, mid, 2*id+1, result);
        if (end > mid) add_ranges_node(fi, begin, end, mid, right, 2*id+2, result);
    }
    
    vector< vector<float> > values;
    vector< vector<int> > node_begin;
    vector< vector<int> > node_end;
    vector<RangeSummary> ranges;
    int size2;
    vector<int> pos;
    int num_fields;
};

struct SNFP_DB
{
public:
    SNFP_DB(int start_af, const char *filename)
    {
        cout << "Loading " << filename << endl;
        GZ_Reader reader = GZ_Reader(filename);
        vector<string> tokens;
        vector<float> values;
        num_af = -1;
        data.clear();
        string header = "###";
        int m = -1;
        while (reader.check_eof())
        {
            string line = reader.get_line();
            tokenize(line, tokens, '\t');
            if (tokens.size() < 5) continue;
            if (num_af < 0)
            {
                num_af = tokens.size() - start_af;
                values.resize(num_af);
                cout << "Headers: no of fields = " << tokens.size() << " nof of AFs = " << num_af << endl;
                continue;
            }
            if (tokens[0] != header)
            {
                if (m >= 0) cout << "chr" + header << " " << data[m].get_size() << endl;
                // if (header != "###") break;
                header = tokens[0];
                m = data.size();
                data.push_back(SNFP_Block());
                data[m].alloc_size(num_af, 100000);
            }
            for (int i = 0; i < num_af; ++i)
            {
                string &s = tokens[i+start_af];
                if (s == ".")
                {
                    values[i] = NAN;
                } else
                {
                    float v = atof(s.c_str());
                    if (v > 1) v = 1;
                    if (v < 1e-60) v = 1e-60;
                    values[i] = -log10(v);
                }
            }
            data[m].add_variant(atoi(tokens[1].c_str()), values);
        }
        reader.close();
        if (m >= 0) cout << "chr" + header << " " << data[m].get_size() << endl;
        for (int i = 0; i <= m; ++i) data[i].build_tree();
        // cout << "DONE" << endl;
    }

    void calc_range_summary(int id, int begin, int end, int *i_res, float *f_res)
    {
        // cout << "Range input " << id << " " << begin << " " << end << endl;
        vector<RangeSummary> rlist;
        int si = num_af;
        int sf = 0;
        for (int fi = 0; fi < num_af; ++fi)
        {
            data[id].find_ranges(fi, begin, end, rlist);
            i_res[fi] = rlist.size();
            // cout << rlist.size();
            for (int i = rlist.size()-1; i >= 0; --i)
            {
                float l = pow(10, -rlist[i].high);
                float h = pow(10, -rlist[i].low);
                i_res[si++] = rlist[i].count;
                f_res[sf++] = l;
                f_res[sf++] = h;
                // cout << "|" << l << " " << h << " " << rlist[i].count;
            }
            // cout << endl;
        }
    }
    
private:
    vector<SNFP_Block> data;
    int num_af;
};

int main(int argc, char ** args)
{
    // RefGenome ref(args[1]);
    // // ref.get_detail_seq(0, 100000, 50);
    // u_int8_t a;
    // u_char b;
    return 0;
}

extern "C" {
	RefGenome* create_RefGenome_instance(const char *filename){ return new RefGenome(filename); }
	void ref_get_headers(RefGenome* obj, char *s){ obj->get_headers(s); }
    void ref_get_seq(RefGenome* obj, int id, int pos, int size, char * s)
        { obj->get_detail_seq(id, pos, size, s); }
    void get_char_count_cumm(RefGenome* obj, int id, int pos, int *out)
        { obj->get_char_count_cumm(id, pos, out); }
    void get_char_count_series(RefGenome* obj, int id, int pos, int step, int size, int *out)
        { obj->get_char_count_series(id, pos, step, size, out); }
    
    SNFP_DB* create_SNFP_DB_instance(int start_af, const char *filename){ return new SNFP_DB(start_af, filename); }
    void db_SNFP_calc_range_summary(SNFP_DB* obj, int id, int begin, int end, int* i_res, float *f_res)
        { obj->calc_range_summary(id, begin, end, i_res, f_res); }
    // const char* ref_get_headers(RefGenome* obj){ return obj->get_headers().c_str(); }
    // const char* ref_get_seq(RefGenome* obj, int id, int pos, int size){ return "detail sequences"; }
	// const char* KhaiTQ_myFunction2(RefGenome* obj, const char *s){ return obj -> myFunction2(s); }
}

