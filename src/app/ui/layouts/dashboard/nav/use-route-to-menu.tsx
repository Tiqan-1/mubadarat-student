import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Iconify, SvgIcon } from "@/app/ui/components/icon";

import { useSettings } from "@/framework/store/settingStore";
import { ThemeLayout } from "@/framework/types/enum";
import type { AppRouteObject } from "@/framework/types/router";
import { cn } from "@/framework/utils";
import { NewFeatureTag } from "@/app/ui/components/NewFeatureTag";
import type { GetProp, MenuProps } from "antd";
import { useFlattenedRoutes, usePermissionRoutes } from "@/framework/router/hooks";
import { menuFilter } from "@/framework/router/utils";
import { useLocation, useNavigate } from "react-router";

type MenuItem = GetProp<MenuProps, "items">[number];

const renderIcon = (icon: string | React.ReactNode): React.ReactNode => {
	if (typeof icon !== "string") return icon;

	return icon.startsWith("ic") ? (
		<SvgIcon icon={icon} size={24} className="ant-menu-item-icon" />
	) : (
		<Iconify icon={icon} size={24} className="ant-menu-item-icon" />
	);
};

/**
 *   routes -> menus
 */
export function useRouteToMenuFn() {
	const { t } = useTranslation();
	const { themeLayout } = useSettings();

	const routeToMenuFn = useCallback(
		(items: AppRouteObject[]): MenuItem[] => {
			return items
				.filter((item) => !item.meta?.hideMenu)
				.map((item) => {
					const { meta, children } = item;
					if (!meta) return {} as MenuItem;

					const menuItem: Partial<MenuItem> = {
						key: meta.key,
						disabled: meta.disabled,
						label: (
							<div
								className={cn(
									"inline-flex items-center overflow-hidden",
									themeLayout === ThemeLayout.Horizontal ? "justify-start" : "justify-between",
								)}
							>
								<div className="">{t(meta.label)}</div>

								{!meta.suffix && meta.newFeature && <NewFeatureTag />}
								{meta.suffix}
							</div>
						),
						...(meta.icon && { icon: renderIcon(meta.icon) }),
						...(children && { children: routeToMenuFn(children) }),
					};

					return menuItem as MenuItem;
				});
		},
		[t, themeLayout],
	);
	return routeToMenuFn;
}



// helper
export function routeToMenuHelperHook(){
	const navigate = useNavigate();
	const { pathname } = useLocation();
	
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

	return {menuList, selectedKeys, onClick};
	
}