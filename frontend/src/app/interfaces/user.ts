export interface User {

    username : string,
    bio : string,
    mail : string,
    imagePath : string,
    language : string,
    id : number
    
}

export interface responseObject{
    users : Friends[]
}


export interface Friends {
    username : string,
    bio : string,
    mail : string,
    imagePath : string,
    language : string,
    id : number
    
}