from PIL import Image
import numpy as np
path= "C:\\Users\\Dell\\Desktop\\py\Photo.jpg"
img=Image.open(path)
print(img.size)
#img.show()

#dims de limage
w,h=img.size
print("Largeur : {} px, hauteur: {} px".format(w,h))

img=img.resize((600,400))

print("Format des pixels:{}".format(img.mode))
px_value=img.getpixel((200, 100))
#print("Valeur du pixel situé en (200,100):{}".format(px_value))

#convertir vers le niveau gris
img=Image.open(path)
img.save("C:\\Users\\Dell\\Desktop\\py\PhotoGray.jpg")
mat=np.array(img)
print(mat)
print("Taille de la matrice de pixels:{}".format(mat.shape))
#on separe les composantes
#R,G,B = img.split()
#R.show()
#G.show()
#B.show()
#conversement, pour les rassemble
#merged=Image.merge("RGB",(R, G, B))
#merged.show()

#EXO: FUSION 2 PICS PAR MAXIMUM PIXEL

img2=Image.open("C:\\Users\\Dell\\Desktop\\py\\Photo2.jpg")

#vérifier la taille
if img.size != img2.size:
    print("Les images doivent avoir la meme taille")
    exit()

img2=img2.resize(img.size)
width, height = img.size

# nouvelle image vide
#result = Image.new("L", (width, height))
# accès aux pixels
#p1 = img.load()
#p2 = img2.load()
#pr = result.load()

# comparaison pixel par pixel
#for x in range(width):
    #for y in range(height):
        #pr[x, y] = max(p1[x, y], p2[x, y])

# afficher et sauvegarder
#result.show()
#result.save(r"C:\\Users\\Dell\\Desktop\\py\\fusion.jpg")

#fusion avec RGB
result = Image.new("RGB", (width, height))

p1 = img.load()
p2 = img2.load()
pr = result.load()

for x in range(width):
    for y in range(height):
        r1, g1, b1 = p1[x, y]
        r2, g2, b2 = p2[x, y]

        pr[x, y] = (
            max(r1, r2),
            max(g1, g2),
            max(b1, b2)
        )

result.show()

#EXO: Seuillage (thresholding)
#Transformer l’image en noir & blanc pur

img = Image.open("C:\\Users\\Dell\\Desktop\\py\Photo.jpg").convert("L")  # image en gris

s = 290   # le seuil (tu peux changer)

width, height = img.size
result = Image.new("L", (width, height))

p = img.load()
pr = result.load()

for x in range(width):
    for y in range(height):
        if p[x, y] < s:
            pr[x, y] = 0
        else:
            pr[x, y] = 255

result.show()


