import apiClient, {_cleanParams, _route, type PaginationResponse} from "@/framework/api/BaseApiClient"; 

export enum AssignmentsApi {
	index = "/assignments/available",
	show = "/assignments/:id",
	start = "/assignment-responses/:id/start",
	submit = "/assignment-responses/:id/submit",
}

export interface CreateRequest extends Partial<Assignment>{ 
} 

const get = (params: {[key:string]:unknown}) => apiClient.get<PaginationResponse<Assignment>>({ url:AssignmentsApi.index, params: _cleanParams(params), headers: {'ngrok-skip-browser-warning': 'true'} });
const show = (id: number|string) => apiClient.get<Assignment>({ url: _route(AssignmentsApi.show, {id}) });
const startAssignment = (id: number|string) => apiClient.post<object>({ url: _route(AssignmentsApi.start, {id}) });
const submitAnswers = (id: number|string, data: object) => apiClient.patch({ url: _route(AssignmentsApi.submit, {id}), data });

export default {
	get,
	show,
  startAssignment,
  submitAnswers
};

//
//
// TYPES
//
//
 
  export enum AssignmentState {
    draft = 'draft',
    published = 'published',
    canceled = 'canceled',
    closed = 'closed',
    deleted = 'deleted',
}
export enum AssignmentType {
    exam = 'exam',
    homework = 'homework',
}
export enum AssignmentGradingState {
    PENDING = 'pending',
    PUBLISHED = 'published',
}

interface Relation {
	id: string
	name: string 
}
export interface Assignment{ 
  id: string 
  title: string 
  programId?: string 
  levelId: string 
  subjectId: string 
  level: Relation 
  subject: Relation 
  createdBy: Relation 
  state: AssignmentState 
  gradingState: AssignmentGradingState;
  type: AssignmentType 
  durationInMinutes: number 
  passingScore: number 
  availableFrom: string
  availableUntil: string
  form: any;
  createdAt: string
  updatedAt: string 
}