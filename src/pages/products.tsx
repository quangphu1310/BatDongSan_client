import { Button, Card, Form, Input, Space, Table, Popconfirm, message, Modal, InputNumber, Select, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { axiosClient } from '.././libraries/axiosClient';
import { notification } from "antd";
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import axios from 'axios';
import dayjs from 'dayjs';
import { error } from 'console';
import { get } from 'http';
import { title } from 'process';

type Props = {};

type FieldType = {
    Title: string;
    Price: number;
    Square: number;
    Rooms: number;
    Address: string;
    DistrictId: string;
    ProvinceId: string;
    Files?: any;
    District: { id: string, name: string };
};



export default function Propertys({ }: Props) {
    const [property, setProperty] = React.useState([]);
    const [addProperty, setAddProperty] = React.useState(false);
    const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
    const [createForm] = Form.useForm<FieldType>();
    const [updateForm] = Form.useForm<FieldType>();
    const [selectedProvince, setSelectedProvince] = React.useState<string | null>(null); // Lưu tỉnh đã chọn
    const [province, setProvince] = React.useState([]);
    const [district, setDistrict] = React.useState([]);
    const [fileList, setFileList] = React.useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        title: '',
        room: '',
        fromSquare: '',
        toSquare: '',
        fromPrice: '',
        toPrice: '',
    });

    // Gọi API lấy dữ liệu với bộ lọc
    const fetchProperties = async () => {
        try {
            const { title, room, fromSquare, toSquare, fromPrice, toPrice } = filters;
            const response = await axiosClient.get(`/api/property`, {
                params: { title, room, fromSquare, toSquare, fromPrice, toPrice },
            });
            setProperty(response.data.result.data);
        } catch (error) {
            console.log('Error:', error);
        }
    };

    // Gọi API mỗi khi filters thay đổi
    useEffect(() => {
        fetchProperties();
    }, [filters]);

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (field: string, value: string) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };


    const getProperty = async () => {
        try {
            const response = await axiosClient.get('/api/property');
            setProperty(response.data.result.data);
            //   console.log(response.data.result.data);
        } catch (error) {
            console.log('Error:', error);
        }
    };
    const getProvince = async () => {
        try {
            const response = await axiosClient.get('/api/province');
            setProvince(response.data.result);
        } catch (error) {
            console.log('Error:', error);
        }
    }
    const getDistrict = async (provinceId: string) => {
        try {
            const response = await axiosClient.get(`/api/district/${provinceId}`);
            const data = response.data.result;
            setDistrict(data);
        } catch (error) {
            console.log('Error:', error);
        }
    }

    const uploadImage = async (file: any) => {
        try {
            const formData = new FormData();
            const id = selectedProperty?.id;
            formData.append('files', file);
            console.log("FormData New Image:", file);
            await axiosClient.post(`/api/PropertyImage/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch (error) {
            console.log('Error:', error);
        }
    }


    React.useEffect(() => {
        getProperty();
        getProvince();
    }, []);

    React.useEffect(() => {
        if (selectedProvince) {
            setDistrict([]); // Xóa hết quận/huyện cũ
            createForm.setFieldsValue({ DistrictId: undefined }); // Xóa giá trị đã chọn của quận/huyện
            getDistrict(selectedProvince);
            getProperty();
        }
    }, [selectedProvince]); // Gọi khi `selectedProvince` thay đổi


    const onFinish = async (values: FieldType) => {
        try {
            console.log('Success:', values.Files?.fileList);
            const formData = new FormData();
            formData.append("Title", values.Title);
            formData.append("Price", values.Price.toString());
            formData.append("Square", values.Square.toString());
            formData.append("Rooms", values.Rooms.toString());
            formData.append("Address", values.Address);
            formData.append("DistrictId", values.DistrictId.toString());

            if (!values.Files || values.Files.length === 0) {
                console.log("Không có file nào được chọn.");
                return;
            }
            values.Files.fileList.forEach((file: any) => {
                console.log("File thực tế:", file.originFileObj || file);
                formData.append("Files", file.originFileObj || file);
            });
            // Kiểm tra nội dung FormData
            console.log("FormData Entries:", Array.from(formData.entries()));
            const response = await axiosClient.post("/api/property", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setFileList([]); // Xóa danh sách file đã chọn
            createForm.resetFields();
            getProperty();
            setAddProperty(false);
            setLoading(false);
        } catch (error: any) {
            console.log("Lỗi:", error.response?.data || error.message);
        }
    };



    const onDelete = async (id: number) => {
        try {
            await axiosClient.delete(`/api/property/${id}`);
            getProperty();
            message.success('Property deleted successfully!');
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const onUpdate = async (values: any) => {
        try {
            console.log('Success:', values);
            if (values.Files?.fileList) {
                for (const file of values.Files.fileList) {
                    await uploadImage(file.originFileObj || file); // ✅ Gửi từng file riêng lẻ
                }
            }
            const data = {
                title: values.Title,
                price: values.Price,
                square: values.Square,
                rooms: values.Rooms,
                address: values.Address,
                districtId: values.DistrictId,
            }
            await axiosClient.put(`/api/property/${selectedProperty.id}`, data);
            getProperty();
            setSelectedProperty(null);
            setLoading(false);
            setTimeout(() => {
                setLoading(false);
                setSelectedProperty(null);
                console.log("Cập nhật thành công:", data);

                // 🎉 Thông báo cập nhật thành công
                notification.success({
                    message: "Cập nhật thành công!",
                    description: "Thông tin đã được cập nhật thành công.",
                    placement: "topRight",
                    duration: 10, // Hiển thị trong 3 giây
                });

            }, 2000); // Giả lập API call
            // Giả lập API call

        } catch (error) {
            console.log('Error:', error);
        }
    };


    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '1%',
            sorter: (a: any, b: any) => a.id - b.id,
            //   render: (text: string, record: any, index: number) => (
            //     <div style={{ textAlign: 'right' }}>{index + 1}</div>
            //   ),
        },
        {
            title: 'Ảnh',
            key: 'propertyImages',
            dataIndex: 'propertyImages',
            width: '5%',
            render: (propertyImages: Array<{ imageUrl: string }>) => (
                <div style={{ textAlign: 'center' }}>
                    {propertyImages?.length > 0 ? (
                        <img
                            src={propertyImages[0].imageUrl}
                            alt="Property"
                            style={{ width: 120, height: 100, objectFit: 'cover', borderRadius: 5 }}
                        />
                    ) : (
                        'No Image'
                    )}
                </div>
            ),
        },
        {
            title: 'Tên tòa nhà',
            dataIndex: 'title',
            key: 'title',
            width: '10%',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: '1%',
            sorter: (a: any, b: any) => a.price - b.price,
        },
        {
            title: 'Diện tích',
            dataIndex: 'square',
            key: 'square',
            width: '1%',
            sorter: (a: any, b: any) => a.square - b.square,
        },
        {
            title: 'Số phòng',
            dataIndex: 'rooms',
            key: 'rooms',
            width: '1%',
            sorter: (a: any, b: any) => a.rooms - b.rooms,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
            width: '10%',
        },
        {
            title: 'Quận/ huyện',
            dataIndex: 'district', // Giữ nguyên dataIndex để lấy từ district
            key: 'province',
            width: '1%',
            filters: Array.from(
                new Set(property.map((p: any) => p.district?.province?.name).filter(Boolean))
            ).map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value: any, record: any) => record.district?.province?.name === value,
            render: (district: { province?: { name: string } } | null) => (
                <div style={{ textAlign: 'right' }}>{district?.province?.name || 'N/A'}</div>
            ),
        },

        {
            title: 'Tỉnh/ thành phố',
            dataIndex: 'district',
            key: 'district',
            width: '1%',
            filters: Array.from(
                new Set(property.map((p: any) => p.district?.name).filter(Boolean))
            ).map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value: any, record: any) => record.district?.name === value,
            render: (district: { name: string } | null) => (
                <div style={{ textAlign: 'right' }}>{district?.name || 'N/A'}</div>
            ),
        },
        {
            title: 'Ngày đăng',
            dataIndex: 'postedDate',
            key: 'postedDate',
            width: '1%',
            filters: Array.from(
                new Set(property.map((p: any) => dayjs(p.postedDate).year().toString()).filter(Boolean))
            ).map((year) => ({
                text: year,
                value: year,
            })),
            onFilter: (value: any, record: any) => dayjs(record.postedDate).year().toString() === value,
            render: (postedDate: string | null) => (
                <div style={{ textAlign: 'right' }}>
                    {postedDate ? dayjs(postedDate).format('DD/MM/YYYY') : 'N/A'}
                </div>
            ),
        },
        {
            title: 'Tùy chọn',
            dataIndex: 'actions',
            key: 'actions',
            width: '1%',
            render: (text: any, record: any) => {
                return (
                    <Space size='small'>
                        <Button
                            type='primary'
                            icon={<EditOutlined />}
                            onClick={() => {
                                setSelectedProperty(record);
                                console.log(record);
                                // Chuyển đổi dữ liệu trước khi đặt vào form
                                const formData = {
                                    Title: record.title,
                                    Price: record.price,
                                    Square: record.square,
                                    Rooms: record.rooms,
                                    Address: record.address,
                                    DistrictId: record.district?.id?.toString() || "",
                                    ProvinceId: record.district?.province?.id?.toString() || "",
                                    Files: record.propertyImages.map((img: { id: number; imageUrl: string }) => ({
                                        uid: img.id.toString(), // ✅ Đặt uid là id từ database
                                        name: img.imageUrl.split('/').pop(),
                                        status: "done",
                                        url: img.imageUrl,
                                    })),
                                };
                                console.log("Province:", formData.ProvinceId);
                                getDistrict(formData.ProvinceId); // Lấy danh sách quận/huyện theo tỉnh đã chọn
                                // updateForm.setFieldsValue(formData);

                                console.log("Form Data:", formData);

                                updateForm.setFieldsValue(formData);
                                setFileList(formData.Files);




                            }}
                        />
                        <Popconfirm
                            title='Delete the property'
                            description='Are you sure to delete this property?'
                            onConfirm={() => {
                                onDelete(record.id);
                            }}
                        >
                            <Button type='primary' danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ padding: 36 }}>
            <Button type='primary' htmlType='submit' onClick={() => {
                setFileList([]);
                setAddProperty(true)
            }
            }>
                Thêm mới
            </Button>

            <Modal
                centered
                title='Add Property'
                open={addProperty}
                okText='Save changes'
                okButtonProps={{ loading: loading }}
                onOk={() => {
                    setLoading(true);
                    createForm.submit();
                    //   if(error){
                    //     console.log('Error:', error);
                    //   }
                    //   else{
                    //  
                    //   }
                }}
                onCancel={() => {
                    setAddProperty(false);
                    setLoading(false);
                }}
            >
                <Form form={createForm} name='Add-Property' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} onFinish={onFinish}>


                    <Form.Item<FieldType> label='Title' name='Title' rules={[{ required: true }]} hasFeedback>
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType> label='Price' name='Price' rules={[{ required: true }]} hasFeedback>
                        <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item<FieldType> label='Square' name='Square' rules={[{ required: true }]} hasFeedback>
                        <InputNumber min={0} max={90} />
                    </Form.Item>
                    <Form.Item<FieldType> label='Rooms' name='Rooms' rules={[{ required: true }]} hasFeedback>
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item<FieldType> label='Address' name='Address' rules={[{ required: true }]} hasFeedback>
                        <Input />
                    </Form.Item>

                    <Form.Item<FieldType>
                        name="ProvinceId"
                        label="Name Province"
                        rules={[{ required: true }]}
                        hasFeedback
                    >
                        <Select
                            options={province.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                            onChange={(value) => {
                                setSelectedProvince(value);
                                setDistrict([]); // Xóa hết quận/huyện cũ
                                createForm.setFieldsValue({ DistrictId: undefined }); // Xóa giá trị đã chọn của quận/huyện
                                getDistrict(value); // Gọi API lấy danh sách quận/huyện mới
                            }}
                        />
                    </Form.Item>



                    <Form.Item<FieldType>
                        name="DistrictId"
                        label="Name District"
                        rules={[{ required: true }]}
                        hasFeedback
                    >
                        <Select
                            options={district.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            }))}

                        />
                    </Form.Item>



                    {/* <Form.Item<FieldType> name="Files" label="Upload Files">
                        <Upload
                            multiple
                            beforeUpload={() => false} // Ngăn chặn tự động upload
                            onChange={(info) => {
                                console.log("File chọn:", info.fileList);
                                setFileList(info.fileList);
                            }}
                            fileList={fileList}
                        >
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </Form.Item> */}

                    <Form.Item<FieldType> name="Files" label="Upload Files">
                        <Upload
                            multiple
                            listType="picture-card" // Hiển thị ảnh dạng thẻ
                            beforeUpload={() => false} // Ngăn chặn tự động upload
                            onChange={(info) => {
                                console.log("File chọn:", info.fileList);
                                setFileList(info.fileList); // Cập nhật danh sách ảnh
                            }}
                            onPreview={async (file) => {
                                let src = file.url || (file.preview && file.preview);
                                if (!src) {
                                    src = await new Promise((resolve) => {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file.originFileObj as Blob);
                                        reader.onload = () => resolve(reader.result as string);
                                    });
                                }
                                const image = new Image();
                                image.src = src || '';
                                const imgWindow = window.open(src);
                                imgWindow?.document.write(image.outerHTML);
                            }}
                            onRemove={(file) => {
                                setFileList(fileList.filter((item) => item.uid !== file.uid));
                            }}
                            fileList={fileList} // Đảm bảo danh sách ảnh có dữ liệu
                        >
                            {fileList.length >= 8 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>



                </Form>
            </Modal>

            <Form
                layout="inline"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    margin: '30px 0',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)', // 2 cột
                        gap: '16px',
                        width: '100%',
                        maxWidth: '800px', // Giới hạn độ rộng
                    }}
                >
                    <Form.Item label="Tên tòa nhà" labelCol={{ span: 8 }} style={{ width: '100%' }}>
                        <Input value={filters.title} onChange={(e) => handleFilterChange('title', e.target.value)} />
                    </Form.Item>

                    <Form.Item label="Số phòng" labelCol={{ span: 8 }} style={{ width: '100%' }}>
                        <Input value={filters.room} onChange={(e) => handleFilterChange('room', e.target.value)} />
                    </Form.Item>

                    <Form.Item label="Diện tích (Min)" labelCol={{ span: 8 }} style={{ width: '100%' }}>
                        <Input value={filters.fromSquare} onChange={(e) => handleFilterChange('fromSquare', e.target.value)} />
                    </Form.Item>

                    <Form.Item label="Diện tích (Max)" labelCol={{ span: 8 }} style={{ width: '100%' }}>
                        <Input value={filters.toSquare} onChange={(e) => handleFilterChange('toSquare', e.target.value)} />
                    </Form.Item>

                    <Form.Item label="Giá (Min)" labelCol={{ span: 8 }} style={{ width: '100%' }}>
                        <Input value={filters.fromPrice} onChange={(e) => handleFilterChange('fromPrice', e.target.value)} />
                    </Form.Item>

                    <Form.Item label="Giá (Max)" labelCol={{ span: 8 }} style={{ width: '100%' }}>
                        <Input value={filters.toPrice} onChange={(e) => handleFilterChange('toPrice', e.target.value)} />
                    </Form.Item>
                </div>

                {/* Reset Form */}
                <Button
                    type="primary"
                    onClick={() => {
                        setFilters({
                            title: '',
                            room: '',
                            fromSquare: '',
                            toSquare: '',
                            fromPrice: '',
                            toPrice: '',
                        });
                    }}
                >
                    Làm mới
                </Button>
            </Form>



            <Card title='Quản lý bất động sản' style={{ width: '100%', marginTop: 36 }}>
                <Table dataSource={property} columns={columns} />
            </Card>


            {/* Form Edit */}
            <Modal
                centered
                title='Edit Property'
                open={selectedProperty}
                okText='Save changes'
                okButtonProps={{ loading: loading }} // Thêm trạng thái loading vào nút OK
                onOk={() => {
                    setLoading(true); // Bật loading khi nhấn submit
                    updateForm
                        .validateFields()
                        .then(() => {
                            updateForm.submit();



                        })
                        .catch(() =>
                            setLoading(false));
                    // Nếu có lỗi validation thì tắt loading           
                }}
                onCancel={() => {
                    setSelectedProperty(null);
                    setLoading(false); // Tắt loading khi đóng modal
                }}
            >
                <Form form={updateForm} name='Edit-Property' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} onFinish={onUpdate}>


                    <Form.Item<FieldType> label='Title' name='Title' rules={[{ required: true }]} hasFeedback>
                        <Input />
                    </Form.Item>
                    <Form.Item<FieldType> label='Price' name='Price' rules={[{ required: true }]} hasFeedback>
                        <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item<FieldType> label='Square' name='Square' rules={[{ required: true }]} hasFeedback>
                        <InputNumber min={0} max={90} />
                    </Form.Item>
                    <Form.Item<FieldType> label='Rooms' name='Rooms' rules={[{ required: true }]} hasFeedback>
                        <InputNumber min={0} />
                    </Form.Item>
                    <Form.Item<FieldType> label='Address' name='Address' rules={[{ required: true }]} hasFeedback>
                        <Input />
                    </Form.Item>

                    <Form.Item<FieldType>
                        name="ProvinceId"
                        label="Name Province"
                        rules={[{ required: true }]}
                        hasFeedback
                    >
                        <Select                          // Thêm thuộc tính này để nhận object { label, value }
                            options={province.map((item: any) => ({
                                label: item.name,
                                value: item.id.toString(),
                            }))}
                            onChange={(value) => {
                                setSelectedProvince(value);
                                setDistrict([]);
                                updateForm.setFieldsValue({ DistrictId: undefined });
                                getDistrict(value.value); // Lấy ID từ object { label, value }
                            }}
                        />
                    </Form.Item>


                    <Form.Item<FieldType>
                        name="DistrictId"
                        label="Name District"
                        rules={[{ required: true }]}
                    >
                        <Select
                            // Thêm thuộc tính này để nhận object { label, value }
                            options={district.map((item: any) => ({
                                label: item.name,
                                value: item.id.toString(),
                            }))}


                        />
                    </Form.Item>




                    <Form.Item<FieldType> name="Files" label="Upload Files">
                        <Upload
                            multiple
                            listType="picture-card" // Hiển thị ảnh dạng thẻ
                            beforeUpload={() => false} // Ngăn chặn tự động upload
                            onChange={(info) => {
                                console.log("File chọn:", info.fileList);
                                setFileList(info.fileList);
                            }}
                            onRemove={async (file) => {
                                try {
                                    const imageId = file.uid; // ✅ UID đã là ID của ảnh trong database

                                    // Gọi API xóa ảnh
                                    const response = await axiosClient.delete(`/api/propertyimage/${imageId}`);
                                    getProperty();

                                    console.log("Xóa ảnh:", response.data);

                                    // Nếu xóa thành công, cập nhật lại danh sách ảnh
                                    setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
                                } catch (error) {
                                    console.error("Lỗi khi xóa ảnh:", error);
                                }
                            }}
                            fileList={fileList} // Đảm bảo fileList có dữ liệu
                        >
                            {fileList.length >= 8 ? null : (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}