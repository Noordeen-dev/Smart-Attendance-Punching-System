using System.Data;
using LogInAPI.Model;
using Microsoft.Data.SqlClient;

public interface IAttendanceService
{
    Task<string> PunchInAsync(int empId);
    Task<string> PunchOutAsync(int empId);
    Task<List<AttendanceDto>> GetTodayAttendance(int empId);
    Task<List<Attendance>> GetAllAttendance(int empId);
    Task<List<EmployeeShift>> GetEmployeeShift(int empId);
    Task<List<TodayList>> GetTodayList(int empId);
}

public class AttendanceService : IAttendanceService
{
    private readonly IConfiguration _config;

    public AttendanceService(IConfiguration config)
    {
        _config = config;
    }

    // Punch-In Method //
    public async Task<string> PunchInAsync(int empId)
    {
        using var con = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        using var cmd = new SqlCommand("sp_attendance", con);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Action", "PUNCH-IN");
        cmd.Parameters.AddWithValue("@EmpID", empId);
        await con.OpenAsync();
        try
        {
            var result = await cmd.ExecuteScalarAsync();
            return result?.ToString() ?? "CHECKED-IN";
        }
        catch (SqlException ex)
        {
            return ex.Message;
        }
    }

    // Punch-Out Method //
    public async Task<string> PunchOutAsync(int empId)
    {
        using var con = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

        using var cmd = new SqlCommand("sp_attendance", con);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Action", "PUNCH-OUT");
        cmd.Parameters.AddWithValue("@EmpID", empId);

        await con.OpenAsync();

        try
        {
            var result = await cmd.ExecuteScalarAsync();
            return result?.ToString() ?? "CHECKED-OUT";
        }
        catch (SqlException ex)
        {
            return ex.Message;
        }
    }

    // Today Attendance Method //
    public async Task<List<AttendanceDto>> GetTodayAttendance(int empId)
    {
        var list = new List<AttendanceDto>();

        using var con = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

        using var cmd = new SqlCommand("sp_attendance", con);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Action", "ATTENDANCE-DETAILS");
        cmd.Parameters.AddWithValue("@EmpID", empId);
        await con.OpenAsync();

        using var dr = await cmd.ExecuteReaderAsync();
        while (await dr.ReadAsync())
        {
            list.Add(new AttendanceDto
            {
                Session = dr.GetInt32(dr.GetOrdinal("SessionNo")),
                Date = dr.GetDateTime(dr.GetOrdinal("AttendanceDate")),
                LogIn = dr.IsDBNull(dr.GetOrdinal("LogIn"))? null : dr.GetDateTime(dr.GetOrdinal("LogIn")),
                LogOut = dr.IsDBNull(dr.GetOrdinal("LogOut"))? null : dr.GetDateTime(dr.GetOrdinal("LogOut")),
                TotalMinutes = dr.IsDBNull(dr.GetOrdinal("TotalMinutes"))? null : dr.GetInt32(dr.GetOrdinal("TotalMinutes")),
                Status = dr.GetString(dr.GetOrdinal("Status"))
            });
        }
        return list;
    }

    // Overall Attendance Method //
    public async Task<List<Attendance>> GetAllAttendance(int empId)
    {
        var list = new List<Attendance>();

        using var con = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        using var cmd = new SqlCommand("sp_attendance", con);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Action", "ATTENDANCE");
        cmd.Parameters.AddWithValue("@EmpID", empId);

        await con.OpenAsync();
        using var dr = await cmd.ExecuteReaderAsync();

        while (await dr.ReadAsync())
        {
            list.Add(new Attendance
            {
                AttendanceID = dr.GetInt32(dr.GetOrdinal("AttendanceID")),
                EmpID = dr.GetInt32(dr.GetOrdinal("EmpID")),
                ShiftID = dr.GetInt32(dr.GetOrdinal("ShiftID")),
                ShiftName = dr.IsDBNull(dr.GetOrdinal("ShiftName")) ? "-" : dr.GetString(dr.GetOrdinal("ShiftName")),
                Date = dr.GetDateTime(dr.GetOrdinal("AttendanceDate")),
                LogIn = dr.IsDBNull(dr.GetOrdinal("LogIn")) ? null: dr.GetDateTime(dr.GetOrdinal("LogIn")),
                LogOut = dr.IsDBNull(dr.GetOrdinal("LogOut")) ? null : dr.GetDateTime(dr.GetOrdinal("LogOut")),
                TotalMinutes = dr.IsDBNull(dr.GetOrdinal("TotalMinutes")) ? 0 : dr.GetInt32(dr.GetOrdinal("TotalMinutes")),
                TotalHours = dr.IsDBNull(dr.GetOrdinal("TotalHours")) ? "0:00" : dr.GetString(dr.GetOrdinal("TotalHours")),
                Status = dr.IsDBNull(dr.GetOrdinal("Status")) ? "Pending" : dr.GetString(dr.GetOrdinal("Status")),
                OverTime = dr.IsDBNull(dr.GetOrdinal("OverTimeMinutes")) ? 0 : dr.GetInt32(dr.GetOrdinal("OverTimeMinutes"))
            });
        }
        return list;
    }

    // Employee Shift Method //
    public async Task<List<EmployeeShift>> GetEmployeeShift(int empId)
    {
        var list = new List<EmployeeShift>();
        using var con = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        using var cmd = new SqlCommand("sp_attendance", con);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Action", "EMPLOYEE-SHIFT");
        cmd.Parameters.AddWithValue("@EmpID", empId);
        await con.OpenAsync();
        using var dr = await cmd.ExecuteReaderAsync();
        while (await dr.ReadAsync())
        {
            list.Add(new EmployeeShift
            {
                EmpID = dr.GetInt32(dr.GetOrdinal("EmpID")),
                ShiftID = dr.GetInt32(dr.GetOrdinal("ShiftID")),
                ShiftName = dr.GetString(dr.GetOrdinal("ShiftName")),
                Name = dr.GetString(dr.GetOrdinal("Name")),
                StartTime = dr.GetTimeSpan(dr.GetOrdinal("StartTime")),
                EndTime = dr.GetTimeSpan(dr.GetOrdinal("EndTime")),
                EffectiveFrom = dr.GetDateTime(dr.GetOrdinal("EffectiveFrom")),
                EffectiveTo = dr.IsDBNull(dr.GetOrdinal("EffectiveTo"))? null : dr.GetDateTime(dr.GetOrdinal("EffectiveTo"))
            });
        }
        return list;
    }

    // Today Presenties Method //
    public async Task<List<TodayList>> GetTodayList(int empId)
    {
        var list = new List<TodayList>();
        using var con = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        using var cmd = new SqlCommand("sp_attendance", con);
        cmd.CommandType = CommandType.StoredProcedure;
        cmd.Parameters.AddWithValue("@Action", "TODAY-LIST");
        cmd.Parameters.AddWithValue("@EmpID", empId);
        await con.OpenAsync();
        using var dr = await cmd.ExecuteReaderAsync();
        while (await dr.ReadAsync())
        {
            list.Add(new TodayList
            {
                ShiftID = dr.GetInt32(dr.GetOrdinal("ShiftID")),
                EmpID = dr.GetInt32(dr.GetOrdinal("EmpID")),
                Name = dr.GetString(dr.GetOrdinal("Name")),
                LogIn = dr.IsDBNull(dr.GetOrdinal("LogIn")) ? null : dr.GetDateTime(dr.GetOrdinal("LogIn")),
                LogOut = dr.IsDBNull(dr.GetOrdinal("LogOut")) ? null : dr.GetDateTime(dr.GetOrdinal("LogOut")),
                Status = dr.IsDBNull(dr.GetOrdinal("Status")) ? "Pending" : dr.GetString(dr.GetOrdinal("Status"))
            });
        }
        return list;
    }   
}


