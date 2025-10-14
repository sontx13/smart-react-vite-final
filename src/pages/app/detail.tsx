import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { IApp } from "@/types/backend";
import { callFetchAppById } from "@/config/api";
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Col, Divider, Row, Skeleton } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";


const ClientAppDetailPage = (props: any) => {
    const [appDetail, setAppDetail] = useState<IApp | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id

    useEffect(() => {
        const init = async () => {
            if (id) {
                setIsLoading(true)
                const res = await callFetchAppById(id);
                if (res?.data) {
                    setAppDetail(res.data)
                }
                setIsLoading(false)
            }
        }
        init();
    }, [id]);

    return (
        <div className={`${styles["container"]} ${styles["detail-job-section"]}`}>
            {isLoading ?
                <Skeleton />
                :
                <Row gutter={[20, 20]}>
                    {appDetail && appDetail.id &&
                        <>
                            <Col span={24} md={16}>
                                <div className={styles["header"]}>
                                    {appDetail.name}
                                </div>

                                <Divider />
                                {parse(appDetail?.description ?? "")}
                            </Col>

                            <Col span={24} md={8}>
                                <div className={styles["app"]}>
                                    <div>
                                        <img
                                            width={200}
                                            alt="example"
                                            src={`${import.meta.env.VITE_BACKEND_URL}/storage/app/${appDetail?.logo}`}
                                        />
                                    </div>
                                    <div>
                                        {appDetail?.name}
                                    </div>
                                </div>
                            </Col>
                        </>
                    }
                </Row>
            }
        </div>
    )
}
export default ClientAppDetailPage;