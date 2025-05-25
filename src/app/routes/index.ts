
import type { Permission } from "@/framework/types/entity";
import { PermissionType } from "@/framework/types/enum";

const routes : Permission[] = [
	{
		id: "main",
		parentId: "",
		label: "app.programs.title",
		name: "Programs",
		icon: "ant-design:read-outlined",
		type: PermissionType.MENU,
		route: "programs",
		component: "/content/programs/list/index.tsx",  
	},
	{
		id: "subscriptions",
		parentId: "",
		label: "app.subscriptions.title",
		name: "Subscriptions",
		icon: "solar:bill-list-outline",
		type: PermissionType.MENU,
		route: "subscriptions", 
		component: "/content/subscriptions/list/index.tsx",
	},
	{
		id: "timetable",
		parentId: "",
		label: "sys.menu.timetable",
		name: "myPrograms",
		icon: "solar:layers-minimalistic-broken",
		type: PermissionType.MENU,
		route: "timetable",
		component: "/content/timetable/index.tsx",
	},


	{
		id: "programs-show",
		parentId: "main",
		label: "app.programs.title",
		name: "Programs",
		icon: "ic-management",
		type: PermissionType.MENU,
		route: "programs/:id",
		component: "/content/programs/show/index.tsx", 
		hide: true,
	}, 


	{
		id: "subscriptions-show",
		parentId: "",
		label: "app.subscriptions.title",
		name: "Subscriptions",
		icon: "solar:book-2-broken",
		type: PermissionType.MENU,
		route: "subscriptions/:id",
		hide:true,
		component: "/content/subscriptions/show/index.tsx",
	},



 
]; 
// const routes : Permission[] = [
// 	{
// 		order: 1,
// 		id: "main",
// 		parentId: "",
// 		label: "app.programs.title",
// 		name: "Programs",
// 		icon: "ant-design:read-outlined",
// 		// type: PermissionType.CATALOGUE,
// 		// route: "/", 
// 		type: PermissionType.MENU,
// 		route: "programs",
// 		component: "/content/programs/list/index.tsx",  
// 	},
// 	{
// 		id: "programs-show",
// 		parentId: "main",
// 		label: "app.programs.title",
// 		name: "Programs",
// 		icon: "ic-management",
// 		type: PermissionType.MENU,
// 		route: "programs/:id",
// 		component: "/content/programs/show/index.tsx", 
// 		hide: true,
// 	}, 





// 	// {
// 	// 	id: "subjects",
// 	// 	parentId: "",
// 	// 	label: "sys.menu.library",
// 	// 	name: "Subjects",
// 	// 	icon: "solar:video-library-broken",
// 	// 	type: PermissionType.MENU,
// 	// 	route: "subjects", 
// 	// 	component: "/content/subjects/list/index.tsx",
// 	// 	hide:true, // hidden for future use
// 	// },
// 	// {
// 	// 	id: "subjects-show",
// 	// 	parentId: "",
// 	// 	label: "app.subjects.title",
// 	// 	name: "Subjects",
// 	// 	icon: "solar:book-2-broken",
// 	// 	type: PermissionType.MENU,
// 	// 	route: "subjects/:id",
// 	// 	hide:true,
// 	// 	component: "/content/subjects/show/index.tsx",
// 	// },
// 	// {
// 	// 	id: "subjects-playlist",
// 	// 	parentId: "",
// 	// 	label: "app.subjects.title",
// 	// 	name: "Playlist",
// 	// 	icon: "solar:book-2-broken",
// 	// 	type: PermissionType.MENU,
// 	// 	route: "playlist/:id",
// 	// 	hide:true,
// 	// 	component: "/content/subjects/playlist/index.tsx",
// 	// },
// 	// {
// 	// 	id: "lessons",
// 	// 	parentId: "",
// 	// 	label: "app.lessons.title",
// 	// 	name: "lessons",
// 	// 	icon: "solar:video-frame-play-horizontal-broken",
// 	// 	type: PermissionType.MENU,
// 	// 	route: "lessons/:id",
// 	// 	hide:true,
// 	// 	component: "/content/lessons/show/index.tsx",
// 	// },



	

// 	{
// 		order: 2,
// 		id: "subscriptions",
// 		parentId: "",
// 		label: "app.subscriptions.title",
// 		name: "Subscriptions",
// 		icon: "solar:bill-list-outline",
// 		type: PermissionType.MENU,
// 		route: "subscriptions", 
// 		component: "/content/subscriptions/list/index.tsx",
// 	},
// 	{
// 		id: "subscriptions-show",
// 		parentId: "",
// 		label: "app.subscriptions.title",
// 		name: "Subscriptions",
// 		icon: "solar:book-2-broken",
// 		type: PermissionType.MENU,
// 		route: "subscriptions/:id",
// 		hide:true,
// 		component: "/content/subscriptions/show/index.tsx",
// 	},



// 	{
// 		order: 3,
// 		id: "timetable",
// 		parentId: "",
// 		label: "sys.menu.timetable",
// 		name: "myPrograms",
// 		icon: "solar:layers-minimalistic-broken",
// 		type: PermissionType.BUTTON,
// 		route: "timetable",
// 		component: "/content/timetable/index.tsx",
// 	},
// 	// { 
// 	// 	id: "exams",
// 	// 	parentId: "",
// 	// 	label: "sys.menu.exams",
// 	// 	name: "Exams",
// 	// 	icon: "ant-design:experiment-twotone",
// 	// 	type: PermissionType.MENU,
// 	// 	route: "exams",
// 	// 	component: "/content/timetable/index.tsx",
// 	// 	hide:true, // hidden for future use
// 	// },
 
// ]; 

export default routes;
 