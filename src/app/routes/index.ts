
import type { Permission } from "@/framework/types/entity";
import { PermissionType } from "@/framework/types/enum";

const routes : Permission[] = [
	{
		id: "main",
		parentId: "",
		label: "app.programs.open-title",
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


	{
		id: "assignment-show",
		parentId: "main",
		label: "app.assignments.title",
		name: "Assignments",
		icon: "ic-management",
		type: PermissionType.MENU,
		route: "assignments/:id",
		component: "/content/assignments/show.tsx", 
		hide: true,
	}, 

 
];  

export default routes;
 