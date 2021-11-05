#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <zlib.h>
#include <algorithm>
#include <sstream>
#include <cmath>
#include <thread>
#include <chrono>
#include <set>

// this_thread::sleep_for(chrono::microseconds(100));

using namespace std;

#include "gz_utils.hh"

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

void load_text_file(string filename, vector<string> &lines)
{
    ifstream fi(filename);
    lines.clear();
    string line;
    while (fi.good())
    {
        getline(fi, line);
        if (line.length() == 0) continue;
        lines.push_back(line);
    }
    fi.close();
}

#define IS_NUMBER(c) ((c >= '0') && (c <= '9'))
bool is_numeric_value(string &s)
{
    int c = 0;
    int n = s.length();
    for (int i = 0; i < n; ++i)
    {
        if (IS_NUMBER(s[i])) continue;
        if (s[i] == '.')
        {
            c++;
            if (c > 1) return false;

        } else
        {
            return false;
        }
    }
    return (n > c);
}

vector<int> field_status;
vector<string> output_lines;
vector<string> headers;

void set_field_status(string filename)
{
    vector<string> lines;
    load_text_file(filename, lines);
    set<string> infos;
    set<string> af;
    int state = 0;
    for (int i = 0; i < lines.size(); ++i)
    {
        if (lines[i] == "###")
        {
            state = 1;
            continue;
        }
        if (state == 0) 
        {
            infos.insert(lines[i]);
        } else
        {
            af.insert(lines[i]);
        }
    }
    int n = headers.size();
    field_status.resize(n);
    for (int i = 0; i < n; ++i)
    {
        field_status[i] = 0;
        if (infos.find(headers[i]) != infos.end())
        {
            field_status[i] = 1;
        } else if (af.find(headers[i]) != af.end())
        {
            field_status[i] = 2;
        }
        if (field_status[i] != 0) cout << i << " " << headers[i] << " " << field_status[i] << endl;
    }
}

struct ThreadProcessor
{
private:
    int qsize;
    int qpos;
    int qend;
    vector<string> queue;
    vector<int> queue_id;
    int status;
    int n;

    void next(int &p)
    {
        ++p;
        if (p == qsize) p = 0;
    }
public:
    vector<int> fc;
    int num_variants;

    ThreadProcessor()
    {
        qsize = 10000;
        queue.resize(qsize);
        queue_id.resize(qsize);
        qpos = 0;
        qend = 0;
        status = 0;
    }

    void reset_stats(int n)
    {
        fc.resize(n);
        for (int i = 0; i < fc.size(); ++i) fc[i] = 0;
        this->n = n;
        num_variants = 0;
    }

    bool is_empty()
    {
        return qpos == qend;
    }

    bool is_queue_full()
    {
        return (qpos == (qend + 1)) || ((qpos == 0) && (qend == qsize-1));
    }

    string getq(int &id)
    {
        string s = queue[qpos];
        id = queue_id[qpos];
        next(qpos);
        return s;
    }

    void add(string s, int id)
    {
        queue[qend] = s;
        queue_id[qend] = id;
        next(qend);
    }

    void run()
    {
        vector<string> tokens;
        while (true)
        {
            while (!is_empty())
            {
                int id;
                string line = getq(id);
                tokenize(line, tokens, '\t');
                if (tokens.size() != n) continue;
                int cc = 0;
                for (int i = 0; i < n; ++i)
                {
                    if (field_status[i] != 2) continue;
                    if (!is_numeric_value(tokens[i])) continue;
                    float x = atof(tokens[i].c_str());
                    // cout << tokens[i] << " " << x << endl;
                    if (isfinite(x)) 
                    {
                        fc[i]++;
                        cc++;
                    }
                }
                if (cc > 0) 
                {
                    string s = "";
                    for (int i = 0; i < n; ++i)
                        if (field_status[i] != 0) 
                        {
                            if (s != "") s += "\t";
                            s += tokens[i];
                        }
                    output_lines[id] = s;
                    num_variants++;
                }
            }
            this_thread::sleep_for(chrono::microseconds(1000));
            // cout << "Thread waiting " << qpos << " " << qend << endl;
            if (status != 0) break;
        }
        
    }

    void set_status(int st)
    {
        status = st;
    }
};

vector<ThreadProcessor> thread_processors;

void thread_run(int id)
{
    thread_processors[id].run();
}

int main(int argc, char ** args)
{
    int num_threads = 10;
    thread_processors.resize(num_threads);
    output_lines.resize(100000000);

    GZ_Reader reader = GZ_Reader(args[1]);
    vector<string> tokens;
    string line = reader.get_line();
    tokenize(line, tokens, '\t');
    int n = tokens.size();
    headers = tokens;
    set_field_status(args[2]);

    for (int i = 0; i < num_threads; ++i) thread_processors[i].reset_stats(n);
    vector<thread> list_threads;
    for (int i = 0; i < num_threads; ++i) list_threads.push_back(thread(thread_run, i));
    int m = 0;
    int id = 0;
    while (reader.check_eof())
    {
        line = reader.get_line();
        if (line == "") continue;
        output_lines[m] = "";
        while (true)
        {
            if (!thread_processors[id].is_queue_full())
            {
                thread_processors[id].add(line, m);
                // cout << m << " " << id << endl;
                break;
            }
            id++;
            if (id == num_threads) id = 0;
        }
        m++;
        // if (m > 10000000) break;
        // cout << m << endl;
        if (m % 100000 == 0) cout << m << endl;
    }
    reader.close();
    for (int i = 0; i < num_threads; ++i) thread_processors[i].set_status(1);
    for (int i = 0; i < num_threads; ++i) list_threads[i].join();
    long s = 0;
    for (int i = 0; i < n; ++i)
    {
        int cc = 0;
        for (int j = 0; j < num_threads; ++j) cc += thread_processors[j].fc[i];
        if (cc == 0) continue;
        cout << headers[i] << " " << cc << endl;
        s += cc;
    }
    int num_variants = 0;
    for (int i = 0; i < num_threads; ++i) num_variants += thread_processors[i].num_variants;
    cout << "Number of SNPs = " << m << endl;
    cout << "Number of SNPs with data = " << num_variants << endl;
    cout << "Total number of valid entries = " << s << endl;

    string outfile = args[3];
    GZFileWriter fo(outfile);
    string hs = "";
    for (int i = 0; i < n; ++i)
        if (field_status[i] != 0)
        {
            if (hs != "") hs += "\t";
            hs += headers[i];
        }
    fo.writeline(hs);
    for (int i = 0; i < m; ++i)
        if (output_lines[i] != "") fo.writeline(output_lines[i]);
    fo.close();
    cout << "Extracted data to " << outfile << endl;
    return 0;
}
