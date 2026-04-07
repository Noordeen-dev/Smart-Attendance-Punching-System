using LogInAPI.Model;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/attendance")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;

    public AttendanceController(IAttendanceService service)
    {
        _service = service;
    }

    [HttpPost("punch-in")]
    public async Task<IActionResult> Punch([FromBody] PunchRequest req)
    {
        var result = await _service.PunchInAsync(req.EmpID);
        if (result == "PUNCHED_IN")
        {
            return Ok(new { message = result });
        }
        return Conflict(new { message = result });
    }

    [HttpPost("punch-out")]
    public async Task<IActionResult> PunchOut([FromBody] PunchRequest req)
    {
        var result = await _service.PunchOutAsync(req.EmpID);
        if (result == "PUNCHED_OUT")
        {

            return Ok(new { message = result });
        }
        return Conflict(new { message = result });
    }

    [HttpGet("today/{empId}")]
    public async Task<IActionResult> GetTodayAttendance(int empId)
    {
        var attendance = await _service.GetTodayAttendance(empId);
        return Ok(attendance);
    }

    [HttpGet("all/{empId}")]
    public async Task<IActionResult> GetAllAttendance(int empId)
    {
        var attendance = await _service.GetAllAttendance(empId);
        return Ok(attendance);
    }

    [HttpGet("shift/{empId}")]
    public async Task<IActionResult> GetEmployeeShift(int empId)
    {
        var shift = await _service.GetEmployeeShift(empId);
        return Ok(shift);
    }
    [HttpGet("today-list/{empId}")]
    public async Task<IActionResult> GetTodayList(int empId)
    {
        var list = await _service.GetTodayList(empId);
        return Ok(list);
    }
}