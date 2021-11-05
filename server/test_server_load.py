import random
import threading
import time
import urllib.request
import random

# url_base = "http://10.124.69.7:8000/api?region="
url_base = "http://3.143.149.107:8000/api?region="

limit = pow(10, 7)
t_list = []

def thread_run(th_id):
    for i in range(100):
        chr = "chr" + str(random.randint(1, 22))
        size = int(pow(10, 4 + 3*random.random()))
        pos = random.randint(10, limit - size)
        pos2  = pos + size
        url = url_base + chr + ":" + str(pos) + "-" + str(pos2)
        # print(url)
        # time.sleep(1)
        start = time.time()
        data = urllib.request.urlopen(url).read()
        t = time.time() - start
        t_list.append(t)
        print(url, size, len(data), round(t, 3)*1000)
        # if ((i % 10) == 0): print("Thread", th_id, i)


num_thread = 5
list_threads = []
for i in range(0, num_thread): 
    th = threading.Thread(target=thread_run, args=(i, ))
    list_threads.append(th)
    th.start()
for th in list_threads: th.join()
print("DONE")
total = 0
n = len(t_list)
for t in t_list: total += t
print("No of samples", len(t_list), "average time = ", total / len(t_list))
t_list.sort()
for i in range(0, 6):
    j = (i*(n-1)) // 5
    print(i*20, "% time = ", int(t_list[j]*1000))




