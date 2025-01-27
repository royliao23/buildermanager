import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../supabaseClient";
import styled from "styled-components";
import SearchBox from "../components/SearchBox";
import Dropdown from "../components/Dropdown";

// Define the job type based on the table schema
interface Job {
  code: number;
  job_category_id: number;
  name: string;
  description: string;
}

// Styled Components for Styling
const Container = styled.div`
  max-width: 1500px;
  margin: 2rem auto;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const Th = styled.th`
  padding: 0.8rem;
  background-color: #007bff;
  color: #fff;
`;

const Td = styled.td`
  padding: 0.8rem;
  text-align: center;
  border: 1px solid #ddd;
`;

const DeleteButton = styled.button`
  padding: 0.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #c82333;
  }
`;
const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 2rem;
`;

const ListItem = styled.li`
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  border-radius: 4px;
  background-color: #fff;
`;

const Modal = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;


const ModalContent = styled.div`
  background: white;
  margin-top:20px;
  padding: 2rem;
  border-radius: 8px;
  max-height: 90vh;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto; /* Enable scrolling for modal content */
  @media (max-width: 768px) {
      width: 95%;
    }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

// Inside the job component...

const JobComp: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [formData, setFormData] = useState<Omit<Job, "code">>({
    job_category_id: 0,
    name: '',
    description: '',
  });
  const [editingCode, setEditingCode] = useState<number | null>(null); // Track which job is being edited
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 1000);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jobCategoryOptions, setJobCategoryOptions] = useState([
    { value: 0, label: "" },
  ]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categ").select("*");
      if (error) throw error;

      // Transform data into { value, label } format
      const transformedData = data.map((item) => ({
        value: item.code, // Assuming `id` is the unique identifier
        label: item.name, // Assuming `name` is the category name
      }));

      console.log("Fetched categories:", transformedData);

      // Update the state with fetched categories
      setJobCategoryOptions(transformedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase.from("job").select("*");
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };


  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll"); // Cleanup on unmount
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value?.toLowerCase()); // Normalize search term for case-insensitive search
  };

  const handleOpenModal = (job?: Job) => {
    if (job) {
      handleEdit(job);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData({
      job_category_id: 0,
      name: '',
      description: '',
    });
    setEditingCode(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingCode !== null) {
        // Update an existing job
        const { error } = await supabase
          .from("job")
          .update(formData)
          .eq("code", editingCode);

        if (error) throw error;

        // Clear editing state after updating
        setEditingCode(null);
      } else {
        // Add a new job
        const { error } = await supabase.from("job").insert([formData]);

        if (error) throw error;
      }

      // Refresh the list and reset the form
      fetchJobs();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingCode(job.code);
    setFormData({
      job_category_id: job.job_category_id,
      name: job.name,
      description: job.description,
    });
  };

  const handleDelete = async (code: number) => {
    try {
      const { error } = await supabase.from("job").delete().eq("code", code);
      if (error) throw error;
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  // Filter jobs dynamically based on the search term

  const filteredJobs = jobs.filter((job) => {
    return (
      (job.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (job.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });


  // Handle Form Input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDropChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };



  return (
    <Container>
      <Title>Job Management</Title>
      <ButtonRow>
        <SearchBox searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <Button onClick={() => handleOpenModal()}>Add Job</Button>
      </ButtonRow>

      {isMobileView ? (
        <List>
          {filteredJobs.map((job) => (
            <ListItem key={job.code}>
              <strong>Job Code:</strong> {job.code} <br />
              <strong>Name:</strong> {job.name} <br />
              <strong>Description:</strong> {job.description} <br />
              <strong>Category:</strong> {jobCategoryOptions.find((option) => option.value === job.job_category_id)?.label || "Unknown"} <br />
              <Button onClick={() => handleOpenModal(job)}>Edit</Button>
              <DeleteButton onClick={() => handleDelete(job.code)}>Delete</DeleteButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Job Code</Th>
              <Th>Job Name</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.code}>
                <Td>{job.code}</Td>
                <Td>{job.name}</Td>
                <Td>{job.description}</Td>
                <Td>{jobCategoryOptions.find((option) => option.value === job.job_category_id)?.label || "Unknown"}</Td>
                <Td>
                  <Button onClick={() => handleOpenModal(job)}>Edit</Button>
                </Td>
                <Td>
                  <DeleteButton onClick={() => handleDelete(job.code)}>Delete</DeleteButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={isModalOpen}>
        <ModalContent>
          <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          <Form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Job Name</label>
              <Input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Job Name"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="description">Description</label>
              <Input
                id="description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description"
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="job_category_id">Job Category</label>
              <Dropdown
                name="job_category_id"
                value={formData.job_category_id}
                onChange={handleDropChange}
                options={jobCategoryOptions}
                placeholder="Select Job Category"
                required
              />
            </div>

            <Button type="submit">Save Job</Button>
          </Form>


        </ModalContent>
      </Modal>
    </Container>
  );
};

export default JobComp;
