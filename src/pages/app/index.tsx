import { Col, Row } from 'antd';
import styles from 'styles/client.module.scss';
import AppCard from '@/components/client/card/app.card';

const ClientAppPage = (props: any) => {
    return (
        <div className={styles["container"]} style={{ marginTop: 20 }}>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <AppCard
                        showPagination={true}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ClientAppPage;