import apiClient, {_route, type PaginationResponse} from "@/framework/api/BaseApiClient";;  

export enum SubscriptionsApi {
	index = "/students/subscriptions/v2",
	create = "/students/subscriptions", 
	show = "/subscriptions/:id",
	update = "/subscriptions/:id",
	delete = "/subscriptions/:id",
}

export interface CreateRequest{
  levelId: string
  programId: string
} 

const get = (params: {[key:string]:unknown}) => apiClient.get<PaginationResponse<Subscription>>({ url: SubscriptionsApi.index, params, headers: {'ngrok-skip-browser-warning': 'true'} });
const create = (data: CreateRequest) => apiClient.post<Subscription>({ url: SubscriptionsApi.create, data });
const show = (id: number|string) => apiClient.get<Subscription>({ url: _route(SubscriptionsApi.show, {id}) });
const update = (id: number|string, data: CreateRequest) => apiClient.put({ url: _route(SubscriptionsApi.update, {id}), data });
const destroy = (id: number|string) => apiClient.delete({ url: _route(SubscriptionsApi.delete, {id}) });

export default {
	get,
	show,
	create,
	update,
	destroy,
};

//
//
// TYPES
//
//

export interface SubscriptionSearch {
	id: string
	programId: string
	subscriberId: string
	levelId: string
	subscriptionDate: string
	state: string
	notes: string
}
// export interface Subscription {
// 	id: string
// 	program: Program
// 	subscriber: Subscriber
// 	level: Level
// 	subscriptionDate: string
// 	state: string
// 	notes: string
// }
interface Subscriber {
	name: string
	email: string
}
// interface Program {
// 	id: string
// 	name: string
// }
// interface Level {
// 	id: string
// 	name: string 
// }
   
  
export interface TaskLesson {
  id: string;
  title: string;
  type: string;
  url: string;
}
export interface LevelTask {
  id: string;
  levelId: string;
  date: string;
  note?: string;
  lessons: TaskLesson[];
}
export interface EnhancedTask extends LevelTask {
  programId: string;
  programName: string;
  levelName: string;
  subscriptionId: string;
}
export interface ProgramLevel {
  id: string;
  name: string;
  start: string;
  end: string;
  programId: string;
  tasks: LevelTask[];
}
export interface ProgramInfo {
  id: string;
  name: string;
  state: string;
  thumbnail: string;
  description: string;
  start: string;
  end: string;
  registrationStart: string;
  registrationEnd: string;
}
export interface Subscription {
  id: string;
  program: ProgramInfo;
  level: ProgramLevel;
  subscriptionDate: string;
  state: string;
  notes?: string
  subscriber?: Subscriber
}