import { Button, Card, Form, Input, Space, Table, Popconfirm, message, Modal, InputNumber, Select, Upload } from 'antd';
import React, { useState } from 'react';
import { axiosClient } from '.././libraries/axiosClient';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import axios from 'axios';
import dayjs from 'dayjs';
import { error } from 'console';

type Props = {};

type FieldType = {
    Title: string;
    Price: number;
    Square: number;
    Rooms: number;
    Address: string;
    DistrictId: string;
    Files?: File[];
  };
  
  

export default function Products({}: Props) {
  const [property, setProperty] = React.useState([]);
  const [addProperty, setAddProperty] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [createForm] = Form.useForm<FieldType>();
  const [updateForm] = Form.useForm<FieldType>();

  const [file, setFile] = React.useState(null);

  const getProperty = async () => {
    try {
      const response = await axiosClient.get('/api/property?pageSize=100&pageNumber=1');
      setProperty(response.data.result.data);
    //   console.log(response.data.result.data);
    } catch (error) {
      console.log('Error:', error);
    }
  };


  React.useEffect(() => {
    getProperty();
  }, []);

  const onFinish = async (values: FieldType) => {
    try {
        console.log('Success:', values.Title);
      const formData = new FormData();
      formData.append("Title", values.Title);
      formData.append("Price", values.Price.toString());
      formData.append("Square", values.Square.toString());
      formData.append("Rooms", values.Rooms.toString());
      formData.append("Address", values.Address);
      formData.append("DistrictId", values.DistrictId.toString());
  
    //   if (values.Files && values.Files.length > 0) {
    //     values.Files.forEach((file) => {
    //       formData.append("Files", file);
    //     });
    //   }
     
    console.log("FormData Entries:", Array.from(formData.entries()));
  
      const response = await axiosClient.post("/api/property", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Response:", response.data);
      createForm.resetFields();
    } catch (error: any) {
      console.log("Lỗi:", error.response?.data || error.message);
    }
  };
  
  

  const onDelete = async (id: number) => {
    try {
      await axiosClient.delete(`/products/${id}`);
      getProperty();
      message.success('Product deleted successfully!');
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const onUpdate = async (values: any) => {
    try {
      console.log('Success:', values);
      await axiosClient.patch(`/products/${selectedProduct._id}`, values);
      getProperty();
      setSelectedProduct(null);
      message.success('Product updated successfully!');
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
      title: 'Picture',
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '10%',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: '1%',
      sorter: (a: any, b: any) => a.price - b.price,
    },
    {
      title: 'Square',
      dataIndex: 'square',
      key: 'square',
      width: '1%',
      sorter: (a: any, b: any) => a.square - b.square,
    },
    {
      title: 'Rooms',
      dataIndex: 'rooms',
      key: 'rooms',
      width: '1%',
      sorter: (a: any, b: any) => a.rooms - b.rooms,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: '10%',
    },
    {
        title: 'District',
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
        title: 'Posted Date',
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
      title: 'Actions',
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
                setSelectedProduct(record);
                updateForm.setFieldsValue(record);
              }}
            />
            <Popconfirm
              title='Delete the product'
              description='Are you sure to delete this product?'
              onConfirm={() => {
                onDelete(record._id);
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
        <Button type='primary' htmlType='submit' onClick={() => setAddProperty(true)}>
              Add Property 
            </Button>
     
      <Modal
        centered
        title='Add Property'
        open={addProperty}
        okText='Save changes'
        onOk={() => {
            createForm.submit();
        //   if(error){
        //     console.log('Error:', error);
        //   }
        //   else{
        //     setAddProperty(false);
        //   }
        }}
        onCancel={() => {
          setAddProperty(false);
        }}
      >
        <Form form={createForm} name='Add-Property' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}  onFinish={onFinish}>
        

          <Form.Item<FieldType> label='Title' name='Title' hasFeedback>
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
          <Form.Item<FieldType> label='Address' name='Address' hasFeedback>
           <Input />
          </Form.Item>
          
          <Form.Item<FieldType> label='DistrictId' name='DistrictId' rules={[{ required: true }]} hasFeedback>
            <Input />
            </Form.Item>


            <Form.Item<FieldType> label='Image' name='Files'>
            <Upload
              listType='text'
              showUploadList={true}
              beforeUpload={(f: any) => {
                setFile(f);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>
            
        
        </Form>
      </Modal>


      <Card title='List of property' style={{ width: '100%', marginTop: 36 }}>
        <Table dataSource={property} columns={columns} />
      </Card>


      

      {/* <Modal
        centered
        title='Edit product'
        open={selectedProduct}
        okText='Save changes'
        onOk={() => {
          updateForm.submit();
        }}
        onCancel={() => {
          setSelectedProduct(null);
        }}
      >
        <Form form={updateForm} name='update-product' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} initialValues={{ name: '', description: '' }} onFinish={onUpdate}>
          <Form.Item<FieldType> name='categoryId' label='Category' rules={[{ required: true }]} hasFeedback>
            <Select
              options={categories.map((item: any) => {
                return {
                  label: item.name,
                  value: item._id,
                };
              })}
            />
          </Form.Item>

          <Form.Item<FieldType> name='supplierId' label='Supplier' rules={[{ required: true }]} hasFeedback>
            <Select
              options={suppliers.map((item: any) => {
                return {
                  label: item.name,
                  value: item._id,
                };
              })}
            />
          </Form.Item>

          <Form.Item<FieldType> label='Name' name='name' rules={[{ required: true }]} hasFeedback>
            <Input />
          </Form.Item>
          <Form.Item<FieldType> label='Price' name='price' rules={[{ required: true }]} hasFeedback>
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item<FieldType> label='Discount' name='discount' rules={[{ required: true }]} hasFeedback>
            <InputNumber min={0} max={90} />
          </Form.Item>
          <Form.Item<FieldType> label='Stock' name='stock' rules={[{ required: true }]} hasFeedback>
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item<FieldType> label='Description' name='description'>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
}