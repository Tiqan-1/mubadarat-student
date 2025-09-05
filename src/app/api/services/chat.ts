import apiClient, {_cleanParams, _route} from "@/framework/api/BaseApiClient";;  

//
//
// ENDPOINTS
//
//

export enum ChatApi {
	join = "/chat/:id/join",
	send = "/chat/:id/send-message",
}

const join = (id: number|string) => apiClient.post<Chat>({ url: _route(ChatApi.join, {id}) });
const send = (id: number|string, data: MessageRequest) => apiClient.post({ url: _route(ChatApi.send, {id}), data });

export default {
	join,
	send,
};

//
//
// TYPES
//
//

export interface MessageRequest {
  message: string
  socketId: string
}

export interface Chat {
  id: string
  createdAt: string
  createdBy: CreatedBy
  messages: Message[]
}

export interface CreatedBy {
  name: string
  email: string
}

export interface Message {
  id: string
  createdAt: string
  updatedAt: string
  text: string
  sender: Sender
}

export interface Sender {
  name: string
  email: string
}
