import apiClient, {_route, _cleanParams, type PaginationResponse} from "@/framework/api/BaseApiClient";;  

export enum ProgramsApi {
	indexOpen = "students/v3/programs",
	// indexOpen = "/students/programs/v2",
	create = "/programs",
	show = "/programs/:id",
	update = "/programs/:id",
	updateThumbnail = "/programs/:id/thumbnail",
	delete = "/programs/:id",
}

export interface CreateRequest extends Partial<Program>{

}

// const get = (params: {[key:string]:unknown} = {}) => apiClient.get<PaginationResponse<Program>>({ url: ProgramsApi.index, params: _cleanParams(params), headers: {'ngrok-skip-browser-warning': 'true'} });
const getOpen = (params: {[key:string]:unknown} = {}) => apiClient.get<PaginationResponse<Program>>({ url: ProgramsApi.indexOpen, params: _cleanParams(params), headers: {'ngrok-skip-browser-warning': 'true'} });
const show = (id: number|string) => apiClient.get<Program>({ url: _route(ProgramsApi.show, {id}), headers: {'ngrok-skip-browser-warning': 'true'} });
const create = (data: CreateRequest) => apiClient.post<Program>({ url: ProgramsApi.create, data });
const update = (id: number|string, data: CreateRequest) => {
	if(data.thumbnail){
		// console.log(data.thumbnail)
		// console.log(`uploading thumbnail for program ${id}`)
		const formData = new FormData();
		formData.append('thumbnail', data.thumbnail);
	  
		return apiClient.post({ 
			url: _route(ProgramsApi.updateThumbnail, {id}), 
			data:formData, 
			// data,
			headers: { 
				'content-type': 'multipart/form-data'
				// 'Content-Type': 'application/x-www-form-urlencoded'

			 }
		});
	}
	return apiClient.put({ url: _route(ProgramsApi.update, {id}), data });
}
// const updateThumbnail = (id: number|string, data: CreateRequest) => apiClient.post({ url: _route(ProgramsApi.updateThumbnail, {id}), data });
const destroy = (id: number|string) => apiClient.delete({ url: _route(ProgramsApi.delete, {id}) });

export default {
	getOpen,
	// get,
	show,
	create,
	update,
	// updateThumbnail,
	destroy,
};

//
//
// TYPES
//
//

export interface Program {
	// isSubscribed?: boolean;
	subscriptionId?: string
	id: string
	name: string
	state: string
	thumbnail: any
	description: string
	programSubscriptionType: "public"|"approval" //public, approval
	subscriptionFormUrl: string|undefined
	createdBy: CreatedBy
	start: string
	end: string
	registrationStart: string
	registrationEnd: string
	levels: Level[]
	studentCount: number|undefined
  }
  
  export interface CreatedBy {
	name: string
	email: string
  }
  
  export interface Level {
    id: string; 
    programId?: string;
	name: string
	start: string
	end: string
    note?: string;
	tasks: Task[]
  }
  
  export interface Task {
	id: string
    levelId?: string; 
	date: string
	lessons: Lesson[]
  }
  
  export interface Lesson {
	id: string
	title: string
	type: string
	url: string
  }