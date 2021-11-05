import random

items = []
characters = "ATGC"

j=1000000117
while j <= 2000000000:
     item = ""
     pos1 = random.randint(j, j+150)
     pos2 = pos1 + 150

     des = ""
     for k in range(151):
          des += characters[random.randint(0,3)]

     item = "chr1" + "\t" + str(pos1)+ "\t" + str(pos2) + "\t" +des +"\n"
     items.append(item)
     j += random.randint(150, 500)

with open('./alignment.txt', 'a') as w:
     for item in items:
          w.write(item)