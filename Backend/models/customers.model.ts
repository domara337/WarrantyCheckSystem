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
    const result=await db.query('SELECT * FROM customers WHERE mobile=$1', [phone_number]);
    return result.rows[0];
};

//Insert a new Customer
export const createCustomer=async(full_name:string,mobile:string,city:string,address:string,contact_person:string,email:string)=>{
    const result=await db.query('INSERT INTO customers(name,mobile,city,address,contact_person,email) VALUES($1,$2,$3,$4,$5,$6) RETURNING *' ,[full_name,mobile,city,address,contact_person,email]);
    return result.rows[0];
}

//Delete a customer by id
export const deleteCustomer=async(id:number)=>{
    const result=await db.query('DELETE FROM customers WHERE id=$1 RETURNING *',[id]);
    return result.rows[0];
}

// Update customer dynamically
export const updateCustomer = async (id: number, fields: Record<string, any>) => {
    const keys = Object.keys(fields);
    
    // If no fields are provided to update, return the existing record
    if (keys.length === 0) {
        return getCustomerbyId(id);
    }

    // Construct "column_name = $1, column_name = $2, ..."
    const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');

    const values = [...Object.values(fields), id];
    const query = `
        UPDATE customers 
        SET ${setClause} 
        WHERE id = $${keys.length + 1} 
        RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
};