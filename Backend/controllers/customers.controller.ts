// Import customer management model queries
import { getAllCustomers, getCustomerbyId, findCustomerByEmail,findCustomerByPhoneNumber, createCustomer, deleteCustomer,updateCustomer} from "../models/customers.model";

// Controller to retrieve all client profiles
export const getCustomers = async (req:any, res:any) => {
  try {
    // Query database for all customer entries
    const customers = await getAllCustomers();
    // Send JSON array of customers with 200 status
    return res.status(200).json(customers);
  } catch (error) {
    // Handle error and return 500 status code
    return res.status(500).json({ 
        message:error instanceof Error ?error:String(error) });
  }
};

// Controller to find a client by their phone number
export const getByMobile = async (req:any, res:any) => {
  try {
    // Get phone number parameter from URL route
    const { mobile } = req.params;
    // Look up customer record matching mobile
    const customer = await findCustomerByPhoneNumber(mobile);
    // Return 404 if phone number does not exist
    if (!customer) return res.status(404).json({ error: "Customer not found with this mobile number." });
    // Respond with customer record
    return res.status(200).json(customer);
  } 
  catch (error) {
    // Respond with status 500 on system error
    return res.status(500).json({ 
        successful:false,
        message:error instanceof Error?error:String(error) });
  }
};

// Controller to fetch a specific customer profile by ID
export const getCustomer = async (req:any, res:any) => {
  try {
    // Extract customer ID parameter from request
    const { id } = req.params;
    // Fetch customer details from DB
    const customer = await getCustomerbyId(id);
    // Return 404 error if customer doesn't exist
    if (!customer) return res.status(404).json({ error: "Customer not found." });
    // Return customer profile details
    return res.status(200).json(customer);
  } catch (error) {
    // Return 500 internal server error
    return res.status(500).
    json({ successful:false,
        message:error instanceof Error?error:String(error)
     });
  }
};

// Controller to create a new customer record
export const addCustomer = async (req:any, res:any) => {
  try {
    // Destructure customer details from request payload
    const { full_name, mobile,city,address,contact_person,email} = req.body;
    // Insert new customer into database table
    const newCustomer = await createCustomer(full_name, mobile,city,address,contact_person,email);
    // Return created customer object with status 201
    return res.status(201).json(newCustomer);
  } catch (error) {
    // Return 500 server error code on error
    return res.status(500).json({ 
      successful:false,
    message:error instanceof Error?error:String(error) });
  }
};

//find customer by email
export const getByEmail = async (req:any, res:any) => {
  try {
    // Extract email parameter from request
    const { email } = req.params;
    // Query database for customer with matching email
    const customer = await findCustomerByEmail(email);

    // Return 404 if no customer found with this email
    if (!customer) return res.status(404).json({ error: "Customer not found with this email." });

    // Return customer record with status 200
    return res.status(200).json(customer);
  }
  catch (error) {
    // Return 500 status code on server error
    return res.status(500).json({

      successful:false,
      message:error instanceof Error?error:String(error) });
  }
}

// Controller to delete a customer profile
export const removeCustomer = async (req:any, res:any) => {
  try {
    // Get customer ID from route parameters
    const { id } = req.params;
    // Run deletion function on customer record
    const deletedCustomer = await deleteCustomer(id);
    // Return 404 if customer record was missing
    if (!deletedCustomer) return res.status(404).json({ error: "Customer not found." });
    // Return status message confirming deletion
    return res.status(200).json({
       message: "Customer deleted successfully." });
  } catch (error) {
    // Return HTTP 500 status on execution error
    return res.status(500).json({ 
      successful:false,
      message:error instanceof Error?error:String(error) });
  }
};

//controller to update the customer
export const UpdatedCustomer=async(req:any, res:any)=>{
try{

  const {id}=req.params;

  //validate ID parameter
  if(!id){
    return res.status(400).json({message:'Invalid customer ID'})

  }
  //get the fields toupdate from the req.body
  const fieldsToUpdate=req.body;


  //Ensure request body is not empty
  if(!fieldsToUpdate || Object.keys(fieldsToUpdate).length==0){
    return res.status(400).json({message:"no fields provided for update"})

  }
  const allowedFields = ['name', 'city','mobile', 'address', 'contact_person'];
        const sanitizedFields: Record<string, any> = {};

        for (const [key, value] of Object.entries(fieldsToUpdate)) {
            if (allowedFields.includes(key)) {
                sanitizedFields[key] = value;
            }
        }

        if (Object.keys(sanitizedFields).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update' });
        }

        const updatedCustomer = await updateCustomer(id, sanitizedFields);

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.status(200).json({
            message: 'Customer updated successfully',
            data: updatedCustomer
        });
    







}
catch(error){
  return res.status(500).json({ 
      successful:false,
      message:error instanceof Error?error:String(error) });

  }
}