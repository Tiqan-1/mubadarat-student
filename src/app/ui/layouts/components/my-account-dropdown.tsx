import { Avatar, type MenuProps } from "antd";
import Dropdown from "antd/es/dropdown/dropdown"; 
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import {
    UserOutlined} from '@ant-design/icons';

import { useRouter } from "@/framework/router/hooks";
import { useUserActions } from "@/framework/store/userStore"; 
import { useLoginStateContext } from "@/app/ui/pages/sys/auth/providers/LoginStateProvider";

const { VITE_APP_HOMEPAGE: HOMEPAGE } = import.meta.env;

/**
 * Account Dropdown
 */
export default function MyAccountDropdown() {
	const { replace } = useRouter(); 
	const { clearUserInfoAndToken } = useUserActions();
	const { backToLogin } = useLoginStateContext();
	const { t } = useTranslation();
	const logout = () => {
		try {
			clearUserInfoAndToken();
			backToLogin();
		} catch (error) {
			console.log(error);
		} finally {
			replace("/login");
		}
	}; 


	const items: MenuProps["items"] = [
		{
			label: <NavLink to={HOMEPAGE}>{t("sys.menu.dashboard")}</NavLink>,
			key: "1",
		},
		// {
		// 	label: <NavLink to="/management/user/account">{t("sys.menu.account")}</NavLink>,
		// 	key: "3",
		// },
		{ type: "divider" },
		{
			label: (
				<button className="font-bold text-warning" type="button">
					{t("sys.login.logout")}
				</button>
			),
			key: "4",
			onClick: logout,
		},
	];

	return (
		<Dropdown menu={{ items }}  trigger={['click']} placement="bottomRight">
			{/* Added trigger={['click']} for better mobile UX */}
			{/* Added placement */}
			<button type='button' onClick={e => e.preventDefault()} style={{ display: 'inline-block' }}> {/* Wrap in anchor for click area */}
					<Avatar shape="circle" icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
				{/* <Badge count={99} overflowCount={99} >
				</Badge> */}
			</button>
		</Dropdown>
	);
}
