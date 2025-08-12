import { FriendsService } from '../service/friends/friends-service';
import { Friends } from '../interfaces/user';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupeService } from '../service/groupe/groupe-service';
import { SocketPrivateService } from '../service/socket-private/socket-private-service';
import { AuthService } from '../service/auth/auth-service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../environments/environment.development';


@Component({
  selector: 'app-chat-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush

})


export class ChatComponent implements OnInit {
  /** Liste des membres du groupe courant (pour affichage des noms dans le chat de groupe) */
  currentGroupMembers: any[] = [];

  /** Indique si le chat de groupe est actif */
  isGroupChatActive: boolean = false;

  /** URL de l'API backend */
  static apiURL = environment.apiURL;

  /** Pour éviter les clics multiples lors du chargement d'un groupe */
  isLoadingGroup: boolean = false;

  /** Service pour gérer les amis */
  friendService = inject(FriendsService)
  /** Service pour gérer les groupes */
  groupService = inject(GroupeService)
  /** Service d'authentification */
  authService = inject(AuthService)

  /** Nom d'utilisateur de l'ami ou du groupe sélectionné */
  selectedFriendUsername: string = '';
  /** Message en cours de saisie */
  newMessage: string = '';

  /** Indique si le chat est activé */
  chatActivate = false;
  /** Section ouverte dans la sidebar (amis, groupes, etc.) */
  openSection: string | null = null;

  /** Utilisateurs trouvés lors de la recherche */
  foundUsers: Friends[] = [];
  /** Valeur du champ de recherche */
  searchValue: string = '';
  /** Liste des demandes d'amis reçues */
  friendRequests: any[] = [];
  /** Liste des amis de l'utilisateur */
  myFriends: Friends[] = [];
  /** Liste des groupes de l'utilisateur */
  groups: any[] = [];
  /** Liste des demandes d'amis envoyées en attente */
  arrayOfSentFriendRequests: any[] = [];
  /** Indique si une demande d'ami a été reçue */
  isIncomingFriendRequest = false;
  /** Indique si une demande d'ami est en attente */
  isFriendRequestPending = false;
  /** Indique si l'utilisateur est ami avec la personne sélectionnée */
  isFriend = false;
  /** Nom de la conversation privée courante */
  conversationName: string = "";

  /** Liste des amis pour la création de groupe */
  userFriend: Friends[] = [];

  /** Liste des messages affichés dans le chat */
  messages: any[] = [];
  /** ID de l'utilisateur courant */
  myUserId: number = 0;
  /** ID de l'ami sélectionné (pour chat privé) */
  selectedFriendId: number | null = null;

  /** Affichage de la modale de confirmation de suppression de message */
  showDeleteModal: boolean = false;
  /** Message à supprimer (stocké pour la modale) */
  messageToDelete: any = null;

  /** Indique si la modale de création de groupe est affichée */
  createGroupAction: boolean = false;

  /** Intervalle pour le rafraîchissement automatique des amis et demandes */
  private refreshInterval: any;

  /** Constructeur : injection des services et du ChangeDetectorRef */
  constructor(
    private cdr: ChangeDetectorRef,
    private socketPrivateService: SocketPrivateService,
    private socketGroupService: GroupeService
  ) { }
  



  /**
   * Retourne le nom de l'expéditeur du message ("Moi" si c'est l'utilisateur courant)
   */
  getSenderName(msg: any): string {
    if (msg.userId === this.myUserId || msg.UserId === this.myUserId) return 'Moi';
    if (this.isGroupChatActive && this.currentGroupMembers?.length) {
      const member = this.currentGroupMembers.find((m: any) => m.id === (msg.userId ?? msg.UserId));
      return member?.username || '';
    }
    return this.selectedFriendUsername;
  }


  /**
   * Initialisation du composant : récupération des données utilisateur, amis, groupes, etc.
   */
  async ngOnInit() {
    try {
      const auth = AuthService.getAuthFromCookies();
      if (auth && auth.id) {
        this.myUserId = Number(auth.id);
      }
      this.friendRequests = await this.friendService.getFriendRequests();
      await this.getMyFriend();
      await this.getGroupUser();
      await this.getPendingSentFriendRequests();
      const savedId = localStorage.getItem('selectedFriendId');

      if (savedId) {
        this.startPrivateChat(Number(savedId));
        const conversationName = localStorage.getItem("conversation_name");

        // recupere l'historique 
        this.extractFinalObjectifFromHistory();
        this.cdr.detectChanges();
      // Démarre le rafraîchissement automatique toutes les 5 secondes
      this.refreshInterval = setInterval(() => {
        this.refreshFriendsAndRequests();
      }, 5000);
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes d'amis", error);
    }
  }



  /**
   * Gestion de la recherche d'utilisateur dans la barre de recherche
   */
  async onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    if (value != "") {
      const data = await this.friendService.fetchInputSearch(value);
      this.foundUsers = data.users;
    } else {
      this.foundUsers = [];
    }
    this.cdr.detectChanges();
  }



  /**
   * Accepte une demande d'ami
   */
  acceptRequest(friendId: number) {
    if (!friendId) return;
    this.friendService.respondToFriendRequest(friendId, "accept")
      .then(() => {
        this.friendRequests = this.friendRequests.filter(req => req.id !== friendId);
        this.isIncomingFriendRequest = false;
        this.isFriendRequestPending = false;
        this.isFriend = true;
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error(error);
      });
  }


  /**
   * Affiche la modale de confirmation de suppression pour un message
   */
  action(msg: string) {
    console.log(msg)

    // Show the delete confirmation modal
    this.messageToDelete = msg;
    this.showDeleteModal = true;
  }

  /**
   * Annule la suppression d'un message (ferme la modale)
   */
  cancelDelete() {
    this.showDeleteModal = false;
    this.messageToDelete = null;
  }


  /**
   * Confirme la suppression d'un message privé
   */
  async confirmDelete(msg: any) {
    this.showDeleteModal = false;
    this.messageToDelete = null;

    try {
      // Suppression d'un message privé uniquement
      await this.socketPrivateService.deleteMessage(msg.id, this.conversationName);
      // Retire le message du visuel
      this.messages = this.messages.filter(m => m.id !== msg.id);
      this.cdr.detectChanges(); // Pour OnPush
    } catch (error) {
      console.error("Erreur lors de la suppression du message", error);
    }
  }




  /**
   * Refuse une demande d'ami
   */
  refuseRequest(friendId: number) {
    if (!friendId) return;
    this.friendService.respondToFriendRequest(friendId, "refuse")
      .then(() => {
        this.friendRequests = this.friendRequests.filter(req => req.id !== friendId);
        this.isIncomingFriendRequest = false;
        this.isFriendRequestPending = false;
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error(error);
      });
  }



  /**
   * Récupère la liste des amis de l'utilisateur
   */
  async getMyFriend() {
    try {
      this.myFriends = await this.friendService.getMyFriend();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste des amis', error);
    }
  }



  /**
   * Retourne le chemin de l'image de profil d'un ami
   */
  getFriendImage(friend: any): string | null {
    if (!friend.imagePath) return null;
    if (typeof friend.imagePath === 'string') return friend.imagePath;
    if (typeof friend.imagePath === 'object' && friend.imagePath.imagePath) return friend.imagePath.imagePath;
    return null;
  }



  /**
   * Récupère la liste des groupes de l'utilisateur
   */
  async getGroupUser() {
    try {
      const res = await this.groupService.fetchGetGroupUser();
      this.groups = res.groups;
    } catch (error) {
      console.error("Erreur lors de la récupération des groupes de l'utilisateur ", error);
    }
  }



  /**
   * Récupère la liste des demandes d'amis envoyées en attente
   */
  async getPendingSentFriendRequests() {
    try {
      const res = await this.friendService.fetchGetPendingSentFriendRequests();
      this.arrayOfSentFriendRequests = res.pendingRequests;
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes en attentes", error);
    }
  }


  /**
   * Démarre une conversation privée avec un ami
   */
  async startPrivateChat(friendUserId: number) {
    if (this.selectedFriendId === friendUserId) {
      return; // Déjà sur ce chat, on ne refait rien
    }

    this.selectedFriendId = friendUserId;
    localStorage.setItem('selectedFriendId', friendUserId.toString());
    const friend = this.myFriends.find(f => f.id === friendUserId);
    this.selectedFriendUsername = friend ? friend.username : 'Ami';
    this.messages = [];
    this.cdr.markForCheck();

    try {
      const tokenHeader = this.authService.insertTokeninHeader();
      const myHeaders = new Headers();
      if (tokenHeader.Authorization) {
        myHeaders.append("Authorization", tokenHeader.Authorization);
      }
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch(`${AuthService.apiURL}/api/chatPrivate/private-chat`, {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify({ friendUserId })
      });

      if (!response.ok) throw new Error('Erreur serveur');
      const data = await response.json();
      this.conversationName = data.chat_name;
      localStorage.setItem("conversation_name", this.conversationName);

      // Charge l'historique APRÈS avoir mis à jour conversationName
      await this.extractFinalObjectifFromHistory();
      this.cdr.detectChanges();

      // Connecte le socket à la room
      this.socketPrivateService.connectSocket(this.myUserId, friendUserId);

      // Nettoie l'ancien listener avant d'en ajouter un nouveau
      if (this.socketPrivateService.socket) {
        this.socketPrivateService.socket.off('chat message');
        this.socketPrivateService.socket.on('chat message', (msg: any) => {
          this.messages = [...this.messages, msg]; // Nouvelle référence pour OnPush
          this.cdr.markForCheck();
          setTimeout(() => {
            const list = document.querySelector('.messages-list');
            if (list) list.scrollTop = list.scrollHeight;
          }, 0);
        });
      }
      this.cdr.markForCheck();

    } catch (error) {
      console.error('Erreur lors de la connexion au chat privé', error);
    }
  }




  /**
   * Récupère l'historique des messages de la conversation privée courante
   */
  async extractFinalObjectifFromHistory() {
    const conversationName = localStorage.getItem("conversation_name");

    const getHistorique = await this.socketPrivateService.getPrivateHistoriqueOfMessage(conversationName!.toString());
    const historiques = getHistorique.body.map((item: any) => ({
      ConversationId: item.dataValues?.ConversationId,
      MessageId: item.dataValues?.MessageId,
      userId: item.dataValues?.SenderId,
      receiverId: item.dataValues?.receiverId,
      id: item.dataValues?.id,
      createdAt: item.dataValues?.createdAt,
      updatedAt: item.dataValues?.updatedAt,
      message: item.message?.content || item.content,
    }));

    this.messages = historiques;
    this.cdr.markForCheck();

    console.log(historiques);
  }


  /**
   * Envoie un message dans le chat (privé ou groupe)
   */
  sendChatMessage(message: string) {
    if (this.isGroupChatActive && this.openSection) {
      console.log(message)
      if (message.trim() !== "") {
        // Récupère le username de l'utilisateur courant
        const myUsername = this.selectedFriendUsername || this.myFriends.find(f => f.id === this.myUserId)?.username || 'Moi';

        // Ajout optimiste pour les messages de groupe
        const optimisticMsg = {
          id: `temp-${Date.now()}`,
          userId: this.myUserId,
          groupId: Number(this.openSection),
          message,
          createdAt: new Date().toISOString(),
        } as any;
        this.messages = [...this.messages, optimisticMsg];
        this.cdr.markForCheck();
        setTimeout(() => {
          const list = document.querySelector('.messages-list') as HTMLElement | null;
          if (list) list.scrollTop = list.scrollHeight;
        }, 0);

        // Envoi réseau
        this.groupService.sendGroupMessage(this.openSection, this.myUserId, message, myUsername);
        this.groupService.fetchSaveGroupMessage(message, Number(this.openSection)); // à remettre si besoin
      }
    } else if (this.selectedFriendId && message.trim() !== "") {
      // Ajout optimiste du message pour que l'UI (OnPush) l'affiche immédiatement
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        userId: this.myUserId,
        receiverId: this.selectedFriendId,
        message,
        createdAt: new Date().toISOString(),
      } as any;
      this.messages = [...this.messages, optimisticMsg];
      this.cdr.markForCheck();
      setTimeout(() => {
        const list = document.querySelector('.messages-list');
        if (list) (list as HTMLElement).scrollTop = (list as HTMLElement).scrollHeight;
      }, 0);

      // Envoi au serveur (le message officiel reviendra via le socket)
      this.socketPrivateService.sendMessage(this.myUserId, this.selectedFriendId, message);
      this.socketPrivateService.saveMessageInBdd(message, this.selectedFriendId, this.conversationName);
    }
  }



  /**
   * Nettoie les sockets et l'intervalle lors de la destruction du composant
   */
  ngOnDestroy() {
    this.socketPrivateService.disconnect();
    this.socketGroupService.disconnectSocket();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * Rafraîchit la liste des amis et des demandes d'amis
   */
  async refreshFriendsAndRequests() {
    await this.getMyFriend();
    this.friendRequests = await this.friendService.getFriendRequests();
    this.cdr.detectChanges();
  }



  /**
   * Fonction de tracking pour l'affichage des messages (optimisation ngFor)
   */
  trackByMsgId(index: number, msg: any) {
    return msg?.id ?? msg?.createdAt ?? index;
  }



  /**
   * Affiche la modale de création de groupe et récupère la liste des amis
   */
  async createGroup() {
    this.createGroupAction = true;
    try {
      const getFriends = await this.friendService.getMyFriend();
      this.userFriend = [];
      for (const friend of getFriends) {
        (this.userFriend as any[]).push(friend);
      }
      console.log(this.userFriend)
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error)
    }
  }


  /**
   * Annule la création de groupe
   */
  cancelGroupCreation() {
    this.createGroupAction = false;
    this.cdr.detectChanges();
  }


  /** IDs des amis sélectionnés pour le nouveau groupe */
  selectedFriendIds: number[] = [];
  /** Nom du nouveau groupe à créer */
  groupName: string = '';

  /**
   * Ajoute ou retire un ami de la sélection pour la création de groupe
   */
  toggleFriendSelection(friendId: number) {
    const idx = this.selectedFriendIds.indexOf(friendId);
    if (idx > -1) {
      this.selectedFriendIds.splice(idx, 1);
    } else {
      this.selectedFriendIds.push(friendId);
    }
  }


  /**
   * Crée le groupe avec les amis sélectionnés et le nom donné
   */
  async confirmGroupCreation() {
    const auth = AuthService.getAuthFromCookies();
    if (auth && auth.id) {
      const myId = Number(auth.id);
      if (!this.selectedFriendIds.includes(myId)) {
        this.selectedFriendIds.push(myId);
      }
    }
    console.log('Nom du groupe:', this.groupName);
    console.log('Utilisateurs sélectionnés:', this.selectedFriendIds);

    try {
      await this.groupService.fetchCreateGroup(this.selectedFriendIds, this.groupName);
      await this.getGroupUser();
    } catch (error) {
      console.error('Erreur lors de la création du groupe', error);
    }

    // Reset input and selection
    this.groupName = '';
    this.selectedFriendIds = [];
    this.createGroupAction = false;
    this.cdr.detectChanges();
  }






  /** ID du groupe actuellement écouté par le socket (pour éviter les doublons) */
  activeGroupListenerId: number | null = null;

  /**
   * Démarre le chat de groupe, récupère les messages et connecte le socket
   */
  async startGroupChat(group: any) {
    // Empêche les clics multiples pendant le chargement
    if (this.isLoadingGroup) return;

    // Si déjà sur ce groupe, ne rien faire (ne touche pas au listener)
    if (this.openSection === group.id && this.isGroupChatActive) {
      return;
    }

    this.isLoadingGroup = true;

    // Ferme tous les listeners existants UNIQUEMENT si on change de groupe
    if (this.groupService.socket && this.activeGroupListenerId !== group.id) {
      this.groupService.socket.off('group message');
      // Ajoute ici d'autres .off() si tu as d'autres listeners
    }

    console.log(group);

    const getMessage = await this.groupService.fetchGetGroupMessages(group.id) as { body?: any[] };
    console.log(getMessage);

    let historiques: any[] = [];
    if (getMessage && Array.isArray(getMessage.body)) {
      historiques = getMessage.body.map((item: any) => {
        const data = item.dataValues || {};
        const msg = item.message || {};
        return {
          ...data,
          userId: data.SenderId,
          groupId: data.GroupId,
          id: data.id,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          message: msg.content || '',
        };
      });
    }

    this.messages = historiques;

    const MemberName = await this.groupService.fetchGetAllGroupMember(group.id);
    this.currentGroupMembers = Array.isArray(MemberName) ? MemberName : [];
    console.log("voici les membres du groupes : ", MemberName);

    this.openSection = group.id;
    this.selectedFriendId = null;
    this.selectedFriendUsername = group.name || 'Groupe';
    this.isGroupChatActive = true;
    this.cdr.markForCheck();

    try {
      // Connecte le socket au groupe
      this.groupService.connectSocket();
      this.groupService.joinGroup(group.id);

      // Ajoute le listener seulement si le groupe est différent
      if (this.groupService.socket && this.activeGroupListenerId !== group.id) {
        this.groupService.socket.off('group message');
        this.groupService.socket.on('group message', (msg: any) => {
          this.messages = [...this.messages, msg];
          this.cdr.markForCheck();
          setTimeout(() => {
            const list = document.querySelector('.messages-list');
            if (list) list.scrollTop = list.scrollHeight;
          }, 0);
        });
        this.activeGroupListenerId = group.id; // Met à jour l'ID du groupe écouté
      }
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Erreur lors de la connexion au chat de groupe', error);
    }
    this.isLoadingGroup = false;
  }


}










