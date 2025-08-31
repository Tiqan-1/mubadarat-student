import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, Skeleton, Space } from "antd";
import { toast } from "sonner";

import assignmentsApi from "@/app/api/services/assignments";
import { useNavigate, useParams } from "react-router";
import { useState, useCallback } from "react";
import {CustomFormRenderer} from 'dynamic-form-renderer';
// import {i18n} from 'dynamic-form-renderer';
import 'dynamic-form-renderer/style.css';
import AssignmentDetails from "./AssignmentDetails";

// http://localhost:1112/#/assignments/68b0cc70e66f609cddbf1ec4
export default function AssignmentPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id:assignmentId } = useParams<{ id: string }>();
    const [assignmentForm, setAssignmentForm] = useState<any>();

    const { data: assignmentData, isLoading: isLoadingAssignment } = useQuery({
        queryKey: ['assignment-details', assignmentId],
        queryFn: () => assignmentsApi.show(assignmentId!),
        enabled: !!assignmentId,
        refetchOnWindowFocus: false
    });

    // Mutation to start exam
    const mutationStart = useMutation({
        mutationFn: () => 
            assignmentsApi.startAssignment(assignmentId!),
        onSuccess: (data) => {
            toast.info(t('app.assignments.exam-started'));
            setAssignmentForm(data)
        },
        onError: (_error: any) => {}
    });


    // Mutation to submit answers
    const mutationSubmit = useMutation({
        // retry: false,
        mutationFn: (values: Record<string, number>) => 
            assignmentsApi.submitAnswers(assignmentId!, values),
        onSuccess: () => {
            toast.success(t('app.assignments.answers-submitted'));
            // navigate(`/assignments/${assignmentId}/responses`);
        },
        onError: (_error: any) => {}
    });

    const onStart = useCallback(() => {
        console.log(mutationStart.status)
        if (!mutationStart.isIdle) return; 
        mutationStart.mutate();
    }, [mutationStart]);

    const onFinish = useCallback((answers: { [key: string]: any }) => {
        // Prevent re-submission while one is already in progress
        if (!mutationSubmit.isIdle) return; 
        mutationSubmit.mutate(answers);
    }, [mutationSubmit]);

    // --- RENDER LOGIC ---
    if (isLoadingAssignment || mutationStart.isPending) {
        return <Card><Skeleton active /></Card>;
    }

    if (!assignmentData || assignmentData===undefined) {
        return <Card>{t('common.no-data')}</Card>;
    }
    if (!assignmentForm || assignmentForm===undefined) {
        return <AssignmentDetails assignment={assignmentData} onStart={onStart} />;
    }
 

    return (
        <Space direction="vertical" size="large" className="w-full">
            <CustomFormRenderer
                formDefinition={assignmentForm} 
                onSubmit={onFinish}
                startedAt={assignmentForm.startedAt}
                durationInMinutes={assignmentData.durationInMinutes}
                language={'ar'}
                // showCorrection={true}
                // isSubmitting={mutationSubmit.isPending} 
            />
        </Space>
    );
}
