type User = {
  token: string;
  email: string;
  password: string;
  name?: string;
  userImageUri?: string;
  companyName?: string;
  companyImageUri?: string;
};

type Department = {
  departmentId: string;
  name: string;
}
type Employee = {
  identityNumber: string;
  name: string;
  employeeImageUri: string;
  gender: string;
  departmentId: string;
};
