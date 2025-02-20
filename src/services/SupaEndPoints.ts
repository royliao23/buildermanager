import { supabase } from "../supabaseClient";

export const fetchJobDetails = async (jobId: number) => {
  try {
    const { data, error } = await supabase.from("job").select("*").eq("code", jobId);
    if (error) throw error;

    return data.length > 0
      ? {
          code: data[0].code,
          job_category_id: data[0].job_category_id,
          name: data[0].name,
          description: data[0].description,
        }
      : null;
  } catch (error) {
    console.error("Error fetching job details:", error);
    return null;
  }
};

export const fetchProjectDetails = async (projectId: number) => {
  try {
    const { data, error } = await supabase.from("project").select("*").eq("code", projectId);
    if (error) throw error;

    return data.length > 0
      ? {
          code: data[0].code,
          project_name: data[0].project_name,
          description: data[0].description,
          manager: data[0].manager,
          status: data[0].status,
        }
      : null;
  } catch (error) {
    console.error("Error fetching project details:", error);
    return null;
  }
};


export const fetchContractorDetails = async (contractorId: number) => {
  try {
    const { data, error } = await supabase.from("contractor").select("*").eq("code", contractorId);
    if (error) throw error;

    return data.length > 0
      ? {
          code: data[0].code,
          contact_person: data[0].contact_person,
          company_name: data[0].company_name,
          phone_number: data[0].phone_number,
          email: data[0].email,
          bsb: data[0].bsb,
          account_no: data[0].account_no,
          account_name: data[0].account_name,
          address: data[0].address,
        }
      : null;
  } catch (error) {
    console.error("Error fetching contractor details:", error);
    return null;
  }
};



export const fetchJobService = async () => {
    try {
      const { data, error } = await supabase.from("job").select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

