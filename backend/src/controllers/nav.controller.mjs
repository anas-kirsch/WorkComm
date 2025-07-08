
import express, { request, response } from "express"


export class NavController {

    /**
     * cette methode static renvoie la page home au client
     */
    static async home(request, response) {

        try {
            console.log("route : home")

            // devra renvoyer la page d'accueil au client
            response.status(200).json('<h1>home page </h1>')



        } catch (error) {
            console.error("erreur : impossible d'acceder")
            response.status(404).json('Access denied to /home')
        }
    }







}