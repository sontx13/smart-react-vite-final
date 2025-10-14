import { callFetchExam } from '@/config/api';
import { convertSlug } from '@/config/utils';
import { IExam } from '@/types/backend';
import { EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styles from 'styles/client.module.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

interface IProps {
    showPagination?: boolean;
}

const ExamCard = ({ showPagination = false }: IProps) => {
    const [displayExam, setDisplayExam] = useState<IExam[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState<string>("");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const sortQuery = "sort=updatedAt,desc";

    // Cập nhật filter từ searchParams
    useEffect(() => {
        const rawFilter = searchParams.get("filter") || "";
        setFilter(rawFilter ? `filter=${decodeURIComponent(rawFilter)}` : "");
        setCurrent(1); // reset về trang đầu khi thay đổi bộ lọc
    }, [location.search]);

    // Gọi API khi current/pageSize/filter/sort thay đổi
    useEffect(() => {
        fetchExam();
    }, [current, pageSize, filter, sortQuery]);

    const fetchExam = async () => {
        try {
            setIsLoading(true);
            let query = `page=${current}&size=${pageSize}`;
            if (filter) query += `&${filter}`;
            if (sortQuery) query += `&${sortQuery}`;

            const res = await callFetchExam(query);
            if (res?.data) {
                setDisplayExam(res.data.result);
                setTotal(res.data.meta.total);
            } else {
                setDisplayExam([]);
            }
        } catch (err) {
            console.error("Lỗi khi gọi API cuộc thi:", err);
            setDisplayExam([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOnchangePage = ({ current: newCurrent, pageSize: newSize }: { current: number; pageSize: number }) => {
        if (newSize !== pageSize) {
            setPageSize(newSize);
            setCurrent(1);
        } else {
            setCurrent(newCurrent);
        }
    };

    const handleViewDetailExam = (item: IExam) => {
        const slug = convertSlug(item.name);
        navigate(`/exam/${slug}?id=${item.id}`);
    };

    return (
        <div className={styles["card-exam-section"]}>
            <div className={styles["exam-content"]}>
                <Spin spinning={isLoading} tip="Đang tải...">
                    <Row gutter={[20, 20]}>
                        <Col span={24}>
                            <div className={isMobile ? styles["dflex-mobile"] : styles["dflex-pc"]}>
                                <span className={styles["title"]}>Cuộc thi mới nhất</span>
                                {!showPagination && <Link to="/exam">Xem tất cả</Link>}
                            </div>
                        </Col>

                        {displayExam?.map((item) => (
                            <Col span={24} sm={12} md={8} lg={6} key={item.id}>
                                <Card size="small" hoverable onClick={() => handleViewDetailExam(item)}>
                                    <div className={styles["card-exam-content"]}>
                                        <div className={styles["card-exam-left"]}>
                                            <img
                                                alt="exam"
                                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/exam/${item.logo}`}
                                                style={{ width: "100%", height: "150px", objectFit: "cover" }}
                                            />
                                        </div>
                                        <div className={styles["card-exam-right"]}>
                                            <div className={styles["exam-title"]}>{item.name}</div>
                                            <div className={styles["exam-location"]}>
                                                <EnvironmentOutlined style={{ color: '#58aaab' }} />
                                                &nbsp;Cấp độ: {item.level}
                                            </div>
                                            <div>
                                                <ThunderboltOutlined style={{ color: 'orange' }} />
                                                &nbsp;Thời gian: {item.time_minutes} phút
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}

                        {!displayExam?.length && !isLoading && (
                            <div className={styles["empty"]}>
                                <Empty description="Không có dữ liệu" />
                            </div>
                        )}
                    </Row>

                    {showPagination && (
                        <div style={{ marginTop: 30 }}>
                            <Row justify="center">
                                <Pagination
                                    current={current}
                                    total={total}
                                    pageSize={pageSize}
                                    responsive
                                    showSizeChanger
                                    onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                                />
                            </Row>
                        </div>
                    )}
                </Spin>
            </div>
        </div>
    );
};

export default ExamCard;
