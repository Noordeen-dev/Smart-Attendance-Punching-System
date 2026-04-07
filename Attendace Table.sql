-- SHIFT DETAILS TABLE --
CREATE TABLE ShiftMaster (
    ShiftID INT IDENTITY PRIMARY KEY,
    ShiftName VARCHAR(50) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    GraceMinutes INT DEFAULT 0,
    IsNightShift BIT DEFAULT 0
);

-- ATTENDANCE DETAILS TABLE --
CREATE TABLE Attendance (
    AttendanceID INT IDENTITY PRIMARY KEY,
    EmpID INT NOT NULL,
    AttendanceDate DATE NOT NULL,

    LogIn TIME NULL,
    LogOut TIME NULL,

    TotalMinutes INT NULL,
    OverTimeMinutes INT NULL,

    ShiftID INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'Present',
    IsLate BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT UQ_Attendance 
        UNIQUE (EmpID, AttendanceDate),

    CONSTRAINT FK_Attendance_Employee
        FOREIGN KEY (EmpID) REFERENCES Employee(EmpID),

    CONSTRAINT FK_Attendance_Shift
        FOREIGN KEY (ShiftID) REFERENCES ShiftMaster(ShiftID)
);

-- EMPLOYEE SHIFT DETAILS TABLE --
CREATE TABLE EmployeeShift (
    EmpID INT NOT NULL,
    ShiftID INT NOT NULL,
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE NULL,

    CONSTRAINT PK_EmployeeShift 
        PRIMARY KEY (EmpID, ShiftID, EffectiveFrom),

    CONSTRAINT FK_EmployeeShift_Employee
        FOREIGN KEY (EmpID) REFERENCES Employee(EmpID),

    CONSTRAINT FK_EmployeeShift_Shift
        FOREIGN KEY (ShiftID) REFERENCES ShiftMaster(ShiftID)
);
