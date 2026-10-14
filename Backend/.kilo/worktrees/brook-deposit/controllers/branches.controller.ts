import {getAllBranches,getBranchById,createBranch,deleteBranch,updateBranch} from '../models/branches.model.ts';

//controller to fetch all branches offices(ER,BAGH,BAS)
export const fetchAllBranches=async(req:any,res:any)=>{
    try{
        //Query model for list of all active branches
        const branches=await getAllBranches();

        //return array of branches as json response
        return res.status(200).json(branches);
    }catch(error){
        return res.status(500).json({error:error instanceof Error ? error.message : String(error)});
    }
}

//controller to retrieve a single branch by ID
export const fetchBranchById=async(req:any,res:any)=>{
    try{
      const {id}=req.params;
      
      const branch=await getBranchById(Number(id));

      if(!branch){
        return res.status(404).json({erorr:`Branch not found`})

        
      }
      //successful retrieval of branch by ID
      return res.status(200).json(branch);


    }
    catch(error){
        return res.status(500).json({error:error instanceof Error ? error.message:String(error)});

    }
}

//controller to create a new branch
export const createNewBranch=async(req:any,res:any)=>{
    try{
        const {name,code}=req.body;

        //insert new branch into database
        const newBranch=await createBranch(name,code);

        return res.status(201).json(newBranch);

    }catch(error){
        return res.status(500).json({error:error instanceof Error ? error.message:String(error)});
    }
}