
static const unsigned GZBUFLEN = 1000000;

struct GZ_Reader
{
public:
    GZ_Reader(string filename)
    {
        zfi = gzopen(filename.c_str(), "rb");
        size = 0;
        pos = 0;
        is_eof = false;
    }

    string get_line()
    {
        string line = "";
        while (true)
        {
            int i = pos;
            while ((i < size) && (buf[i] != '\n')) ++i;
            buf[i] = '\0';
            const char *s = (const char *)(buf + pos);
            line += s;
            if (i < size) 
            {
                pos = i+1;
                return line;
            }
            // we need to load next block to
            pos = 0;
            size = gzread(zfi, buf, GZBUFLEN);
            if (size == 0) 
            {
                is_eof = true;
                return line;
            }
        }
    }

    bool check_eof()
    {
        return !is_eof;
    }

    bool close()
    {
        if (gzclose(zfi) != Z_OK) return false;
        return true;
    }

    bool open_OK()
    {
        return (zfi != NULL);
    }

private:
    gzFile zfi;
    char buf[GZBUFLEN+1];
    int size;
    int pos;
    bool is_eof;
};

struct GZFileWriter
{
    GZFileWriter(string filename)
    {
        open(filename);
    }

    void open(string _filename, int _buffer_size = GZBUFLEN)
    {
        filename = _filename;
        buffer_size = _buffer_size;
        out = gzopen(filename.c_str(), "wb");
        buffer = new char[buffer_size];
        current_pos = 0;
        num_lines = 0;
    }

    void writeline(string &s)
    {
        num_lines++;
        for (int i = 0; i <= s.length(); ++i)
        {
            if (i < s.length()) 
            {
                buffer[current_pos++] = s[i];
            } else
            {
                buffer[current_pos++] = '\n';
            }
            if (current_pos == buffer_size)
            {
               gzwrite(out, buffer, buffer_size);
               current_pos = 0;
            }
        }
    }

    void close()
    {
        if (current_pos > 0) gzwrite(out, buffer, current_pos);
        if (gzclose(out) != Z_OK) 
        {
            cerr << "ERROR cannot close file " << filename << endl;
        } else
        {
            cout << filename + " OK!" << endl;
            delete buffer;
        }
        
    }
private:
    string filename;
    char * buffer;
    int buffer_size;
    int current_pos;
    gzFile out;
    int num_lines;
};
