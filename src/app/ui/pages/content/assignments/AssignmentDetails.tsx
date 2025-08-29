import type React from "react";
import { Card, Descriptions, Button, Space, Typography } from "antd";
import { type Assignment, AssignmentState } from "@/app/api/services/assignments";
import { t } from "i18next";

const { Title } = Typography;

interface Props {
  assignment: Assignment;
  onStart: (id: string) => void;
}

const AssignmentDetails: React.FC<Props> = ({ assignment, onStart }) => {

  return (
    <Card
      style={{ maxWidth: 700, margin: "0 auto" }}
      title={<Title level={4}>{assignment.title}</Title>}
      extra={t(`app.assignments.types.${assignment.type}`)}
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label={t('app.fields.level')}>{assignment.level.name}</Descriptions.Item>
        <Descriptions.Item label={t('app.fields.subject')}>{assignment.subject.name}</Descriptions.Item>
        <Descriptions.Item label={t('app.fields.durationInMinutes')}>{assignment.durationInMinutes} min</Descriptions.Item>
        <Descriptions.Item label={t('app.fields.passingScore')}>{assignment.passingScore}</Descriptions.Item>
        <Descriptions.Item label={t('app.fields.availableFrom')}>{new Date(assignment.availableFrom).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label={t('app.fields.availableUntil')}>{new Date(assignment.availableUntil).toLocaleString()}</Descriptions.Item>
        {/* <Descriptions.Item label="Created By">{assignment.createdBy.name}</Descriptions.Item> */}
      </Descriptions>

      <Space style={{ marginTop: 16 }}>
        <Button
          type="primary"
          onClick={() => onStart(assignment.id)}
          disabled={assignment.state !== AssignmentState.published}
        >
          {t('app.actions.start-assignment')}
        </Button>
      </Space>
    </Card>
  );
};

export default AssignmentDetails;
