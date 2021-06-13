const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

// Connect to database
const connection = mysql.createConnection({
  host: 'localhost',
  // Your MySQL username,
  user: '',
  // Your MySQL password
  password: '',
  database: 'tracker'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to the database");
  questions();
});

const questions = () => {
  return inquirer.prompt([
    {
      type: "list",
      name: "choices",
      message: "What would you like to do?",
      choices: [
        "View All Employees", 
        "View All Employees By Department", 
        "View All Employees By Manager", 
        "Add Employee",
        "Remove Employee", 
        "Update Employee Role", 
        "Update Employee Manager",
        "View All Roles",
        "Add Role",
        "Remove Role"
      ]
    }
  ])
  .then((answers) => {
    const {choices} = answers;
    if (choices === "View All Employees") {
      allEmployees();
    }
    else if (choices === "View All Employees By Department") {
      allEmployeesByDepartment();
    }
    else if (choices === "View All Employees By Manager") {
      allEmployeesByManager();
    }
    else if (choices === "Add Employee") {
      addEmployee();
    }
    else if (choices === "Remove Employee") {
      removeEmployee();
    }
    else if (choices === "Update Employee Role") {
      updateEmployeeRole();
    }
    else if (choices === "Update Employee Manager") {
      updateEmployeeManager();
    }
    else if (choices === "View All Roles") {
      allRoles();
    }
    else if (choices === "Add Role") {
      addRole();
    }
    else if (choices === "Remove Role") {
      removeRole();
    }
  });
}

async function allEmployees() {
  const sql = 
  `SELECT employee.id, employee.first_name, employee.last_name, 
  role.title AS title, department.name as department, role.salary as salary,
  CONCAT (emp_mng.first_name, " ", emp_mng.last_name) as manager
  FROM employee 
  LEFT JOIN role ON employee.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id 
  LEFT JOIN employee AS emp_mng ON employee.manager_id = emp_mng.id`;
  connection.query(sql, function(err, results) {
      if (err) {
          throw err;
      }    
      console.table(results);
      questions();
  });
};

async function allEmployeesByDepartment() {
  const sql = 
  `SELECT employee.first_name, employee.last_name, 
  department.name as department
  FROM employee 
  LEFT JOIN role ON employee.role_id = role.id
  LEFT JOIN department ON role.department_id = department.id`;
  connection.query(sql, function(err, results) {
      if (err) {
          throw err;
      }    
      console.table(results);
      questions();
  });
};

async function allEmployeesByManager() {
  const sql = 
  `SELECT employee.first_name, employee.last_name, 
  CONCAT (emp_mng.first_name, " ", emp_mng.last_name) as manager
  FROM employee
  LEFT JOIN employee AS emp_mng ON employee.manager_id = emp_mng.id`;
  connection.query(sql, function(err, results) {
      if (err) {
          throw err;
      }    
      console.table(results);
      questions();
  });
};

async function addEmployee() {
  const managerInfo = 
  `SELECT empl.manager_id, empl.first_name, empl.last_name, mgr.first_name, mgr.last_name, mgr.id 
  FROM employee mgr 
  LEFT JOIN employee empl ON empl.manager_id = mgr.id WHERE empl.manager_id is not null`;

  const roleInfo = 
  `SELECT id, title, salary, department_id FROM role`;

    connection.query(roleInfo, (err, roles) => {
        if(err) {
          throw err; 
        } 

        connection.query(managerInfo, (err, managers) => {
            if(err) {
                throw err;
            }
          
            const chooseRole = roles.map(role => {
                const roleChoice = {name: role.title, value: role.id};
                return roleChoice;
            });


            const chooseManager = managers.map(mgr => {
                const managerChoice = {name: mgr.first_name + " " + mgr.last_name , value: mgr.id};
                return managerChoice;
            });


            inquirer.prompt([
                {
                  type: 'input',
                  name: 'firstName',     
                  message: "What is the employee's first name?"
                },
                {
                  type: 'input',
                  name: 'lastName',
                  message: "What is the employee's last name?"
                },
                {
                  type: 'list',
                  name: 'roleId',
                  message: 'Select a role for new employee.',
                  choices: chooseRole
                },
                {
                  type: 'list',
                  name: 'managerId',
                  message: 'Select a manger for new employee.',
                  choices: chooseManager
                }
            ])
            
            .then(answer => {
                const sql = `INSERT INTO employee SET ?`;
                connection.query(sql, 
                    {
                      first_name: answer.firstName,
                      last_name: answer.lastName,
                      role_id: answer.roleId,
                      manager_id: answer.managerId 
                    },  
                    (err, result) => {
                        if(err) {
                            throw err;
                        } 
                        console.log("Success"," " + answer.firstName + " " + answer.lastName, "has been added!");
                        questions();
             
                    });
            });
        });
    });
};


async function removeEmployee() {

  const sql = 
  `SELECT * FROM employee`;
  connection.query(sql, (err, employees) => {
      if(err) {
          throw err;
      }
      
      const chooseEmployee = employees.map(employee => {
          const employeeChoice = {name: employee.first_name + " " + employee.last_name, value: employee.id};
          return employeeChoice;
      });

      inquirer.prompt([
          {
              type: 'list',
              name: 'delete',
              message: 'Which employee do you want to delete?',
              choices: chooseEmployee
          }
      ])
      .then(answer => {
          const sql = `DELETE FROM employee WHERE id = ?`;
          connection.query(sql, answer.delete, (err, result) => {
              if(err) {
                  throw err;
              }
              console.log('Success employee has been removed!');
              
              questions();    
          });
      });
  });
};

async function updateEmployeeRole() {

  const employees = 
  `SELECT * FROM employee`;
  const roles = 
  `SELECT * FROM role`;

  connection.query(employees, (err, updateEmployee) => {
      if(err) { 
          throw err;
      }
      connection.query(roles, (err, updateRole) => {
          if(err) {
              throw err;
          }
          
          const employees = updateEmployee.map(employee => {
              const employeeInfo = {name: (employee.first_name + " " + employee.last_name) , value: employee.id};
              return employeeInfo;
          });

          const roles = updateRole.map(role => {
              const roleInfo = {name: role.title, value: role.id};
              return roleInfo;
          });

          inquirer.prompt([
              {
                  type: 'list',
                  name: 'employees',
                  message: 'Select employee to update.',
                  choices: employees
              },
              {
                  type: 'list',
                  name: 'roles',
                  message: 'Select the new role for employee.',
                  choices: roles
              }
          ])
          .then(answer => {
              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
              const params = [answer.role, answer.employees]
              connection.query(sql, params, (err, result) => {
                  if(err) {
                      throw err;
                  }  
                  console.log('Role has been updated!');
                  questions();
         
              });
          });
      });
  });
};

async function updateEmployeeManager() {

  const employee = 
  `SELECT * FROM employee`;
  const manager =   
  `SELECT empl.manager_id, empl.first_name, empl.last_name, man.first_name, man.last_name, man.id
  FROM employee man
  LEFT JOIN employee empl ON empl.manager_id = man.id 
  WHERE empl.manager_id is not null`;


  connection.query(employee, (err, employees) => {
      if(err) throw err;

      connection.query(manager, (err, managers) => {
          if(err) {
              throw err;
          }

          const chooseEmployee = employees.map(employee => {
              const employeeChoice = {name: (employee.first_name + " " + employee.last_name) , value: employee.id};
              return employeeChoice;
          })

          const chooseManager = managers.map(man => {
              const managerChoice = {name: man.first_name + " " + man.last_name , value: man.id};
              return managerChoice;
          })

          inquirer.prompt([
              {
                  type: 'list',
                  name: 'employees',
                  message: 'Select an employee update.',
                  choices: chooseEmployee
              },
              {
                  type: 'list',
                  name: 'managers',
                  message: 'Select a manager to update',
                  choices: chooseManager
              }
          ])
          .then(answer => {
              const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
              const params = [answer.managers, answer.employees]
              connection.query(sql, params, (err, result) => {
                  if(err) {
                      throw err;
                  }
                  console.log('Manager has been Updated!');
                  questions();
          
              });
          });
      });
  });
};

async function allRoles() {
  const sql = 
  `SELECT id, title
  FROM role`;
  connection.query(sql, function(err, results) {
      if (err) {
          throw err;
      }    
      console.table(results);
      questions();
  });
};

async function addRole() {
    
  inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the title of the role?'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the role?'
      },
      {
        type: 'list',
        name: 'department',
        message: 'What department will this role be in?',
        choices: ['Sales', 'Engineering', 'Finance', 'Legal']
      }
  ])
    
  .then(answer => {
      
      let dept = answer.department;
      let salary = answer.salary;
      let title = answer.title;
      let deptId = '';
      
      if (dept === 'Sales') {
          deptId = '1';
      } else if (dept === 'Engineering') {
          deptId = '2';
      } else if (dept === 'Finance') {
          deptId = '3';
      } else if (dept === 'Legal') {
          deptId = '4';
      } else {
          console.log('no ID matches');
      }
        
      const sql = `INSERT INTO role SET ?`;
      connection.query(sql, 
          {
            title: title, 
            salary: salary, 
            department_id: deptId}, 
          (err, result) => {
          
              if (err) {
                  throw err;
              }
              console.log('Success added: '+ title);
              questions();
          });       
  });         
};

async function removeRole() {

  const sql = `SELECT * FROM role`;
  connection.query(sql, (err, role) => {
      if(err) {
          throw err;
      }

      const chooseRole = role.map(role => {
          const roles = {name: role.title, value: role.id};
          return roles;
      });

    inquirer.prompt([
        {
            type: 'list',
            name: 'delete',
            message: 'Choose a role to delete?',
            choices: chooseRole
        }
    ])
    .then(answer => {
        const sql = `DELETE FROM role WHERE id = ?`;
        connection.query(sql, answer.delete, (err, result) => {
            if(err) {
                throw err;
            }
            console.log('Success role has been removed!');
            questions();        
        });
    });
});
};



