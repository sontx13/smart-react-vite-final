import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IExam } from "@/types/backend";
import { callFetchExamById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton, Tag } from "antd";
import { DollarOutlined, EnvironmentOutlined, HistoryOutlined } from "@ant-design/icons";
import { getLocationName } from "@/config/utils";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from "@/components/client/modal/apply.modal";
dayjs.extend(relativeTime)


const ClientExamDetailPage = (props: any) => {
    const [examDetail, setExamDetail] = useState<IExam | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // exam id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchExamById(id);
                if (res?.data) {
                    setExamDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-exam-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {examDetail && examDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {examDetail.name}
                                </div>
                                <div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className={styles["btn-apply"]}
                                    >Apply Now</button>
                                </div>
                                <Divider />
                                <div className={styles["time_minutes"]}>
                                    <DollarOutlined />
                                    <span>&nbsp;{(examDetail.time_minutes + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} p</span>
                                </div>
                                <div className={styles["level"]}>
                                    <EnvironmentOutlined style={{ color: '#58aaab' }} />&nbsp;{examDetail.level}
                                </div>
                                <div>
                                    <HistoryOutlined /> {examDetail.updatedAt ? dayjs(examDetail.updatedAt).locale("en").fromNow() : dayjs(examDetail.createdAt).locale("en").fromNow()}
                                </div>
                                <Divider />
                                {parse(examDetail.description)}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["company"]}>
                                    <div>
                                        <img
                                            width={"200px"}
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/exam/${examDetail.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {examDetail.company?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
            {/* <ApplyModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                examDetail={examDetail}
            /> */}
        </div>
    )
}
export default ClientExamDetailPage;