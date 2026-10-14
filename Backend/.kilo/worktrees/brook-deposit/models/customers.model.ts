import db from '../config/db.js';

//get all customers
export const getAllCustomers=async()=>{
    const result=await db.query('SELECT * FROM customers ORDER BY id ASC');
    return result.rows;
}

//get customer by id
export const getCustomerbyId=async(id:number)=>{
    const result=await db.query('SELECT * FROM customers WHERE id=$1',[id]);
    return result.rows[0];
}

//find customer by email
export const findCustomerByEmail = async (email: string) => {
    const result=await db.query('SELECT * FROM customers WHERE email=$1', [email]);
    return result.rows[0];
};

//get customer by phone number
export const findCustomerByPhoneNumber=async (phone_number: string) => {
    const result=await db.query('SELECT * FROM customers WHERE phone_number=$1', [phone_number]);
    return result.rows[0];
};

//Insert a new Customer
export const createCustomer=async(fullname:string,email:string,phone_number:string,address:string)=>{
    const result=await db.query('INSERT INTO customers(full_name,email,phone_number,address) VALUES($1,$2,$3,$4) RETURNING *' ,[fullname,email,phone_number,address]);
    return result.rows[0];
}

//Delete a customer by id
export const deleteCustomer=async(id:number)=>{
    const result=await db.query('DELETE FROM customers WHERE id=$1 RETURNING *',[id]);
    return result.rows[0];
}