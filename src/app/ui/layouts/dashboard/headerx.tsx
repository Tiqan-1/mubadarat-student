import type React from "react";
import { useMemo } from "react";

import { Button, Grid, Menu, type MenuProps, Space, theme } from "antd";

import { MenuOutlined } from "@ant-design/icons";
import Logo from "../../components/logo";
import { useLocation, useNavigate } from "react-router";
import { useRouteToMenuFn } from "./nav/use-route-to-menu";
import { useFlattenedRoutes, usePermissionRoutes } from "@/framework/router/hooks";
import { menuFilter } from "@/framework/router/utils"; 
import SearchBar from "../components/search-bar";
import LocalePicker from "../../components/locale-picker";
import SettingButton from "../components/setting-button";
import AccountDropdown from "../components/account-dropdown";
import NoticeButton from "../components/notice";
import { useUserToken } from "@/framework/store/userStore";
 

const { useToken } = theme;
const { useBreakpoint } = Grid;

export default function HeaderX() {
	const userToken = useUserToken();
 

  const { token } = useToken();
  const screens = useBreakpoint();
  
  //
  //
  //
  //
  //


  
	const navigate = useNavigate();
	const { pathname } = useLocation();
	// const pathname = usePathname();

	const routeToMenuFn = useRouteToMenuFn();
	const permissionRoutes = usePermissionRoutes();
	const flattenedRoutes = useFlattenedRoutes();

	const menuList = useMemo(() => {
		const menuRoutes = menuFilter(permissionRoutes);
		return routeToMenuFn(menuRoutes);
	}, [routeToMenuFn, permissionRoutes]);

	const selectedKeys = useMemo(() => [pathname], [pathname]);

	const onClick: MenuProps["onClick"] = ({ key }) => {
		const nextLink = flattenedRoutes?.find((el) => el.key === key);
		// Handle special case for external links in menu items
		// For external links: skip internal routing, avoid adding new tab in current project,
		// prevent selecting current route, and open link in new browser tab
		if (nextLink?.hideTab && nextLink?.frameSrc) {
			window.open(nextLink?.frameSrc, "_blank");
			return;
		}
		navigate(key);
	};

    //
    //
    //
    //
    //

//   const menuItems = [
//     {
//       label: "Projects",
//       key: "projects",
//     },
//     {
//       label: "Dashboard",
//       key: "dashboard",
//     },
//     {
//       label: "Products",
//       key: "SubMenu",
//       children: [
//         {
//           label: "Ant Design System",
//           key: "product:1",
//         },
//         {
//           label: "Ant Design Charts",
//           key: "product:2",
//         },
//       ],
//     },
//     {
//       label: "Settings",
//       key: "alipay",
//     },
//   ];

//   const [current, setCurrent] = useState("projects");
//   const onClick = (e:any) => {
//     console.log("click ", e);
//     setCurrent(e.key);
//   };

  const styles : {[key:string]: React.CSSProperties} = {
    container: {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      margin: "0 auto",
      maxWidth: token.screenXL,
      padding: screens.md ? `0px ${token.paddingLG}px` : `0px ${token.padding}px`
    },
    header: {
      backgroundColor: token.colorBgContainer,
      borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
      position: "relative"
    },
    logo: {
      display: "block",
      height: token.sizeLG,
      left: "50%",
      position: screens.md ? "static" : "absolute",
      top: "50%",
      transform: screens.md ? " " : "translate(-50%, -50%)"
    },
    menu: {
      backgroundColor: "transparent",
      borderBottom: "none",
      lineHeight: screens.sm ? "4rem" : "3.5rem",
      marginLeft: screens.md ? "0px" : `-${token.size}px`,
      width: screens.md ? "inherit" : token.sizeXXL
    },
    menuContainer: {
      alignItems: "center",
      display: "flex",
      gap: token.size,
      width: "100%"
    }
  };

  return (
    <nav style={styles.header}>
      <div style={styles.container}>
        <div style={styles.menuContainer}>
            <Logo /> 
            <Menu
                style={styles.menu}
                mode="horizontal"
                items={menuList}
                onClick={onClick}
                selectedKeys={screens.md ? selectedKeys : undefined}
                // defaultOpenKeys={[]}
                // className="!border-none"
                overflowedIndicator={
                    <Button type="text" icon={<MenuOutlined />} />
                }
            /> 
          {/* <Menu
            style={styles.menu}
            mode="horizontal"
            items={menuItems}
            onClick={onClick}
            selectedKeys={screens.md ? [current] : undefined}
            overflowedIndicator={
              <Button type="text" icon={<MenuOutlined />} />
            }
          /> */}
        </div>
        {
          (userToken.accessToken) ? (
            <Space size="middle">
                  <SearchBar />
                  <LocalePicker />
                  {/* TODO: ADD NOTIFS */}
                  <NoticeButton /> 
                  <SettingButton />
                  <AccountDropdown />
            </Space>) : (<Space>
                  {screens.md ? <Button type="text">Log in</Button> : ""}
                  <Button type="primary">Sign up</Button>
          </Space>)
        }
      </div>
    </nav>
  );
}