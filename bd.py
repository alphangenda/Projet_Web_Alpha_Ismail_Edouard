"""
Connexion à la BD
"""

import os
import types
import contextlib
import mysql.connector


@contextlib.contextmanager
def creer_connexion():
    """Pour créer une connexion à la BD"""
    #À modifier avec vos informations
    conn = mysql.connector.connect(
        user="42005c",
        password="qwerty123",
        host="127.0.0.1",
        database="eco_flex",
        raise_on_warnings=True
    )

    conn.get_curseur = types.MethodType(get_curseur, conn)

    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    else:
        conn.commit()
    finally:
        conn.close()


@contextlib.contextmanager
def get_curseur(self):
    """Permet d'avoir les enregistrements dans un dictionnaire"""
    curseur = self.cursor(dictionary=True, buffered=True)
    try:
        yield curseur
    finally:
        curseur.close()