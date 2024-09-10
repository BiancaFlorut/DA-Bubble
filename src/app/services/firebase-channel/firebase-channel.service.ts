import { Injectable, inject, OnDestroy } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { addDoc, collection, deleteDoc, doc, getDoc, Unsubscribe, updateDoc } from 'firebase/firestore';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';
import { User } from '../../interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class FirebaseChannelService implements OnDestroy {
  public firestore: Firestore = inject(Firestore);
  public firebaseService: FirebaseService = inject(FirebaseService);
  public userService: UserService = inject(UserService);

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  public channels: Channel[] = [];
  public usersFromChannel: User[] = [];
  public userChannelsContent: { channel: Channel, messages: Message[] }[] = [];
  public userChannels: any[] = [];
  private unsubs: Unsubscribe[] = [];

  public channel: Channel = {
    id: '',
    name: '',
    description: '',
    creator: '',
  };
  messages: Message[] = [];
  subMessages: any;

  public currentChannelName: string = '';
  public openCreatedChannel: boolean = false;
  
  private unsubChannels: any;

  /**
   * Subscribes to the 'channels' collection and sets the channelsSubject with the latest channels when the collection changes.
   * Also subscribes to the 'users' collection and calls the processChannels() method to process the channels and users when the collection changes.
   */
  constructor() {
    this.getChannels();
    this.channels$.subscribe(channels => {
      this.firebaseService.users$.subscribe(users => {
        this.processChannels(channels, users);
      });
    });
  }

  /**
   * Returns a reference to the 'channels' collection in the firestore.
   * @returns A CollectionReference to the 'channels' collection.
   */
  private getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  /**
   * Adds a new channel to the database, and sets the current channel id to the newly created channel id.
   * Also updates the user's channelIds array to include the new channel id.
   */
  public async addNewChannel() {
    await addDoc(this.getChannelsRef(), this.channel)
      .then(async res => {
        this.channel.id = res.id;
        await this.updateChannel(res.id);
        this.userService.currentChannel = res.id;
        this.firebaseService.currentUser.channelIds?.push(res.id);
        this.firebaseService.updateUser(this.firebaseService.currentUser);
      })
      .catch(err => {
        console.error(err)
      });
  }

  /**
   * Returns a reference to a single channel document in the firestore.
   * @param docId The id of the channel document to retrieve.
   * @returns A DocumentReference to the channel document.
   */
  public getSingleChannel(docId: string) {
    return doc(this.getChannelsRef(), docId);
  }

  /**
   * Updates a channel in the firestore.
   * @param id The id of the channel to update.
   */
  public async updateChannel(id: string) {
    let docRef = this.getSingleChannel(id);
    await updateDoc(docRef, this.getJSONFromChannel(this.channel));
  }

  /**
   * Converts a channel to a JSON object, which is then
   * immediately parsed back into a new object. This is
   * useful for creating a deep copy of an object, as the
   * stringification and parsing process removes any
   * existing references to other objects.
   * @param channel The channel to convert to a JSON object
   * @returns A new object with the same properties as the
   * original, but with no references to external objects
   */
  private getJSONFromChannel(channel: Channel) {
    return JSON.parse(JSON.stringify(channel));
  }

  /**
   * Subscribes to the channels collection and updates the channelsSubject 
   * with the latest channels when the collection changes.
   * @returns An unsubscribe function that can be used to unsubscribe from the 
   * channels collection.
   */
  public getChannels() {
    this.unsubChannels = onSnapshot(this.getChannelsRef(), querySnapshot => {
      this.channels = [];
      querySnapshot.forEach(doc => {
        this.channels.push(doc.data() as Channel);
      });
      this.channelsSubject.next(this.channels);
    });
  }

  /**
   * Processes the given channels and users by filtering the channels the current user is part of
   * and creating a new array of channels with the corresponding messages.
   * @param channels The channels to process.
   * @param users The users to process.
   */
  public processChannels(channels: Channel[], users: User[]): void {
    if (channels.length > 0) {
      this.userChannels = [];
      channels.forEach(channel => {
        users.forEach(user => {
          user.channelIds?.forEach(id => {
            if (user.uid === this.firebaseService.currentUser.uid) {
              if (id === channel.id) {
                if (!this.userChannels.includes(channel)) {
                  this.userChannels.push(channel);
                  this.userChannelsContent.push({ channel: channel, messages: this.getChannelMessages(channel.id) });
                }
              }
            }
          });
        });
      });
    }
  }

  /**
   * Gets the messages from a given channel. The messages are sorted in descending order by their timestamp.
   * @param channelId The id of the channel from which the messages should be retrieved.
   * @returns An array of messages.
   */
  getChannelMessages(channelId: string): Message[] {
    const channelDocRef = this.getSingleChannel(channelId);
    let messages: Message[] = [];
    const unsubMessages = onSnapshot(collection(channelDocRef, 'messages'), querySnapshot => {
      querySnapshot.forEach(doc => {
        messages.push(doc.data() as Message);
      });
      messages = this.messages.sort((a, b) => b.timestamp - a.timestamp);
    });
    this.unsubs.push(unsubMessages);
    return messages;
  }


  /**
   * Clean up all subscriptions when the component is destroyed.
   * This is important to prevent memory leaks.
   */
  ngOnDestroy() {
    this.unsubs.forEach(unsub => unsub());
    if (this.unsubChannels) {
      this.unsubChannels();
    }
  }

  /**
   * Deletes a channel with the given id.
   * @param channelId The id of the channel to delete.
   */
  public async deleteChannel(channelId: string) {
    const channelDocRef = this.getSingleChannel(channelId);
    await deleteDoc(channelDocRef);
  }

  /**
   * Resets the channel and messages to their initial states.
   * This is called when the user navigates away from a channel.
   */
  resetChannel() {
    this.channel = {
      id: '',
      name: '',
      description: '',
      creator: '',
    };
    this.messages = [];
    if (this.subMessages) {
      this.subMessages();
    }
  }

  /**
   * Checks if the channel is set, i.e. if the channel id is not empty.
   * @returns {boolean} True if the channel is set, false otherwise.
   */
  isChannelSet(): boolean {
    return this.channel.id !== '';
  }

  /**
   * Sends a message in the current channel.
   * @param text The text of the message to be sent
   */
  async sendMessage(text: string) {
    const message = new Message('', this.firebaseService.currentUser.uid!, text, Date.now(), []);
    const channelDocRef = this.getSingleChannel(this.channel.id);
    const messageDocRef = await addDoc(collection(channelDocRef, 'messages'), this.getJSONFromObject(message));
    await updateDoc(doc(collection(channelDocRef, 'messages'), messageDocRef.id), { mid: messageDocRef.id });
  }

  /**
   * Sends a message to the given channel.
   * @param channelId The id of the channel to which the message should be sent.
   * @param text The text of the message to be sent.
   */
  async sendMessageToChannel(channelId: string, text: string) {
    const message = new Message('', this.firebaseService.currentUser.uid!, text, Date.now(), []);
    const channelDocRef = this.getSingleChannel(channelId);
    const messageDocRef = await addDoc(collection(channelDocRef, 'messages'), this.getJSONFromObject(message));
    await updateDoc(doc(collection(channelDocRef, 'messages'), messageDocRef.id), { mid: messageDocRef.id });
  }

  /**
   * Converts an object to a JSON object, which is then
   * immediately parsed back into a new object. This is
   * useful for creating a deep copy of an object, as the
   * stringification and parsing process removes any
   * existing references to other objects.
   * @param obj The object to convert to a JSON object
   * @returns A new object with the same properties as the
   * original, but with no references to external objects
   */
  getJSONFromObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Subscribes to the messages of the current channel and updates the messages array on change.
   * If the subscription is already active, it unsubscribes from the previous one first.
   * Sorts the messages by timestamp in descending order after each change.
   */
  subscribeToMessages() {
    const channelDocRef = this.getSingleChannel(this.channel.id);
    if (this.subMessages) this.subMessages();
    this.subMessages = onSnapshot(collection(channelDocRef, 'messages'), querySnapshot => {
      this.messages = [];
      querySnapshot.forEach(doc => {
        this.messages.push(doc.data() as Message);
      });
      this.messages = this.messages.sort((a, b) => b.timestamp - a.timestamp);
    })
  }

  /**
   * Returns the reference to the current channel document.
   * @returns A DocumentReference to the current channel document.
   */
  getCurrentChannelRef() {
    return doc(this.getChannelsRef(), this.channel.id);
  }

  /**
   * Returns the reference to the 'messages' subcollection of the current channel.
   */
  getChannelMessagesRef() {
    return collection(this.getCurrentChannelRef(), 'messages');
  }

  /**
   * Returns the reference to a message in the current channel.
   * @param mid The id of the message to which the reference should be retrieved
   */
  getChannelRefForMessage(mid: string) {
    return doc(this.getSingleChannel(this.channel.id), 'messages', mid);
  }

  /**
   * Returns the reference to the thread subcollection of a message in the current channel.
   * @param mid The id of the message to which the thread subcollection should be retrieved
   */
  getChannelThreadForMessage(mid: string) {
    return collection(doc(this.getSingleChannel(this.channel.id), 'messages', mid), 'thread');
  }

  /**
   * Edits a message in the current channel.
   * @param message The message to edit
   */
  async editMessage(message: Message) {
    const channelDocRef = this.getSingleChannel(this.channel.id);
    const messageDocRef = doc(channelDocRef, 'messages', message.mid);
    await updateDoc(messageDocRef, this.getJSONFromObject(message));
  }

  /**
   * Sets a message as a thread message of the current channel.
   * Copies the message into a new document in the 'thread' subcollection
   * and updates the original document with the id of the new thread message.
   * @param mid The id of the message to set as a thread message
   */
  async setThread(mid: string) {
    const messageRef = doc(this.getSingleChannel(this.channel.id), 'messages', mid);
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const ref = collection(messageRef, 'thread');
      let message = messageDoc.data() as Message;
      message.answerCount = 0;
      message.isAnswer = true;
      const refNewThreadMessage = await addDoc(ref, message);
      await updateDoc(doc(ref, refNewThreadMessage.id), { tid : refNewThreadMessage.id });
      await updateDoc(messageRef, { thread: refNewThreadMessage.id });
    }
  }

  /**
   * Adds a new message as a thread to an existing message in the current channel
   * @param mid The id of the message to which the new message should be added as a thread
   * @param message The message to add
   */
  async addThreadMessage(mid: string, message: Message) {
    const ref = collection(doc(this.getSingleChannel(this.channel.id), 'messages', mid), 'thread');
    const messageDoc = await addDoc(ref, JSON.parse(JSON.stringify(message)));
    await updateDoc(doc(ref, messageDoc.id), { tid: messageDoc.id });
  }

}