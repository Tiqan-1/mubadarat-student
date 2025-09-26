import type React from "react";
import {
  Breadcrumb,
} from "antd";
import {
  CalendarOutlined,
  ReadOutlined,
  BookOutlined,
} from "@ant-design/icons";  
import "dayjs/locale/ar";
import type { ProgramLevel, LevelTask, Subscription, PlaylistItem } from "@/app/api/services/subscriptions";

import { formatDateLocale, getPlaylistItemIcon } from "./SubscriptionTaskPlaylist";


interface SubscriptionBreadcrumbProps {
  subscription: Subscription | null;
  level: ProgramLevel | undefined;
  selectedTask: LevelTask | undefined;
  selectedItem: PlaylistItem | undefined;
}
export const SubscriptionBreadcrumb: React.FC<SubscriptionBreadcrumbProps> = ({
  subscription,
  level,
  selectedTask,
  selectedItem,
}) => {
  
  return (
    <Breadcrumb separator="›" style={{ marginBottom: "5px" }}>
      {" "}
      <Breadcrumb.Item href="#">
        {" "}
        <BookOutlined />{" "}
        <span style={{ marginRight: "4px" }}>
          {subscription?.program?.name || "..."}
        </span>{" "}
      </Breadcrumb.Item>{" "}
      <Breadcrumb.Item href="#">
        {" "}
        <ReadOutlined />{" "}
        <span style={{ marginRight: "4px" }}>
          {level?.name || "..."}
        </span>{" "}
      </Breadcrumb.Item>{" "}
      {selectedTask && (
        <Breadcrumb.Item>
          {" "}
          <CalendarOutlined />{" "}
          <span style={{ marginRight: "4px" }}>
            مهمة {formatDateLocale(selectedTask.date)}
          </span>{" "}
        </Breadcrumb.Item>
      )}{" "}
      {selectedItem && (
        <Breadcrumb.Item>
          {" "}
          {getPlaylistItemIcon(selectedItem)}{" "}
          <span style={{ marginRight: "4px" }}>{selectedItem.title}</span>{" "}
        </Breadcrumb.Item>
      )}{" "}
    </Breadcrumb>
  );
};