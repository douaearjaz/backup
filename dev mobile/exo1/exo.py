def calcul_moyenne(notes):
    return sum(notes) / len(notes) if notes else 0

def saisie_notes():
    notes = []
    for i in range(3):
        while True:
            try:
                note = float(input(f"Entrez la note {i+1} (0-20) : "))
                if 0 <= note <= 20:
                    notes.append(note)
                    break
                else:
                    print("Note invalide, entre 0 et 20.")
            except ValueError:
                print("Entrez un nombre valide.")
    return notes

def ajouter_etudiant(liste):
    print("\n--- Ajouter un étudiant ---")
    nom = input("Entrez le nom de l'étudiant : ")
    notes = saisie_notes()
    moyenne = calcul_moyenne(notes)
    etudiant = {
        "nom": nom,
        "notes": notes,
        "moyenne": moyenne,
        "validation": "Validé" if moyenne >= 10 else "Ajourné"
    }
    liste.append(etudiant)
    print(f"{nom} ajouté avec succès !")

def modifier_etudiant(liste):
    print("\n--- Modifier un étudiant ---")
    nom = input("Entrez le nom de l'étudiant à modifier : ")
    for etu in liste:
        if etu["nom"] == nom:
            print(f"Saisissez les nouvelles notes pour {nom} :")
            etu["notes"] = saisie_notes()
            etu["moyenne"] = calcul_moyenne(etu["notes"])
            etu["validation"] = "Validé" if etu["moyenne"] >= 10 else "Ajourné"
            print(f"{nom} a été modifié avec succès !")
            return
    print("Étudiant non trouvé.")

def supprimer_etudiant(liste):
    print("\n--- Supprimer un étudiant ---")
    nom = input("Entrez le nom de l'étudiant à supprimer : ")
    for etu in liste:
        if etu["nom"] == nom:
            liste.remove(etu)
            print(f"{nom} a été supprimé !")
            return
    print("Étudiant non trouvé.")

def get_moyenne(etudiant):
    return etudiant["moyenne"]

def afficher_classement(liste):
    print("\n--- Classement des étudiants ---")
    if not liste:
        print("Liste vide.")
        return

    liste_triee = sorted(liste, key=get_moyenne, reverse=True)

    for i, etu in enumerate(liste_triee, start=1):
        print(f"{i}. {etu['nom']}: Notes={etu['notes']}, Moyenne={etu['moyenne']:.2f}, {etu['validation']}")

def menu():
    etudiants = []
    while True:
        print("\n===== MENU =====")
        print("1. Ajouter un étudiant")
        print("2. Ajouter plusieurs étudiants")
        print("3. Modifier un étudiant")
        print("4. Supprimer un étudiant")
        print("5. Afficher la liste avec classement")
        print("6. Quitter")
        choix = input("Choisissez une option (1-6) : ")

        if choix == "1":
            ajouter_etudiant(etudiants)
        elif choix == "2":
            n = int(input("Combien d'étudiants voulez-vous ajouter ? "))
            for _ in range(n):
                ajouter_etudiant(etudiants)
        elif choix == "3":
            modifier_etudiant(etudiants)
        elif choix == "4":
            supprimer_etudiant(etudiants)
        elif choix == "5":
            afficher_classement(etudiants)
        elif choix == "6":
            print("Fin du programme. Au revoir !")
            break
        else:
            print("Choix invalide, veuillez entrer un nombre entre 1 et 6.")

if __name__ == "__main__":
    menu()
