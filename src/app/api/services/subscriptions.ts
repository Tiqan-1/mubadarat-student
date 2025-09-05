import apiClient, {_route, type PaginationResponse} from "@/framework/api/BaseApiClient";;  

export enum SubscriptionsApi {
	index = "/students/subscriptions/v2",
	create = "/students/subscriptions/v2/create", 
	show = "/subscriptions/:id",
	update = "/subscriptions/:id",
	delete = "/subscriptions/:id",
}

export interface CreateRequest{
  // levelId: string
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
interface Subscriber {
	name: string
	email: string
}

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
  chatRoomId?: string;
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
  levels: ProgramLevel[];
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
  subscriptionDate: string;
  state: string;
  notes?: string
  subscriber?: Subscriber
}









export function getCurrentOrNextLevel(subscription: Subscription): ProgramLevel | undefined {
  if(!subscription?.program?.levels){
    return undefined
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the currently active level
  const currentLevel = subscription.program.levels.find(level => {
    const startDate = new Date(level.start);
    const endDate = new Date(level.end);
    // Set endDate to the very end of its day to make the range inclusive
    endDate.setHours(23, 59, 59, 999); 
    
    return today >= startDate && today <= endDate;
  });

  if (currentLevel) {
    return currentLevel;
  }

  // If no current level, find the next upcoming one
  const upcomingLevels = subscription.program.levels
    .filter(level => {
      const startDate = new Date(level.start);
      // Check if the level starts after today
      return startDate > today;
    })
    .sort((a, b) => {
      // Sort by start date to find the soonest one
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

  // Return the first upcoming level, or undefined if there are no more levels
  return upcomingLevels[0];
}