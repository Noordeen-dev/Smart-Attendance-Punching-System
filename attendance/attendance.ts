import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.css']
})
export class Attendance implements OnInit, OnDestroy {

  today = new Date();
  currentTime = '';
  attendanceList: any[] = [];
  allAttendance: any[] = [];
  todayPresent: any[] = [];
  employeeShift: any[] = [];

  empId!: number;
  Name = 'Employee';
  profileImage = 'assets/images/User.png';

  punchInDisabled = false;
  punchOutDisabled = false;

  selectedTable: string = 'today';


  apiUrl = 'http://localhost:5216/api/attendance';
  userUrl = 'http://localhost:5216/api/log';

  private timerId: any;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const id = sessionStorage.getItem('empId');
      this.empId = id ? Number(id) : NaN;
    }
    if (!this.empId) {
      this.router.navigate(['login']);
      return;
    }

    this.loadUser();
    this.loadAttendance();
    this.loadAllAttendance();
    this.loadToday();
    this.loadShift();

    this.timerId = setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('en-GB');
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  /** SHOW SWEETALERT POPUP **/
  showAlert(icon: 'success' | 'error' | 'warning' | 'info' | 'question', title: string, message: string) {
    const safeMessage = message.replace(/'/g, "\\'");
    Swal.fire({
      icon: icon,
      title: title,
      text: safeMessage,
      timer: 2000,
      showConfirmButton: false
    });
  }

  /** USER PROFILE **/
  loadUser(): void {
    this.http.get<any>(`${this.userUrl}/get-employee-by-id/${this.empId}`)
      .subscribe({
        next: res => {
          this.Name = res?.name ?? 'Employee';
          if (res?.profileImage) {
            this.profileImage = `data:image/png;base64,${res.profileImage}`;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.Name = 'Employee';
          this.profileImage = 'assets/images/User.png';
        }
      });
  }

  /** PUNCH IN **/
  punchIn(): void {
    this.http.post(`${this.apiUrl}/punch-in`, { EmpID: this.empId })
      .subscribe({
        next: (res:any) => {
          this.showAlert('success', res.message, `User ${this.empId} is punched in`);
          this.loadAttendance();
        },
        error: err => this.showAlert('error', 'Error', err?.error?.message ?? 'Punch-in failed')
      });
  }

  /** PUNCH OUT **/
  punchOut(): void {
    this.http.post(`${this.apiUrl}/punch-out`, { EmpID: this.empId })
      .subscribe({
        next: (res: any) => {
          this.showAlert('success', res.message, `User ${this.empId} is punched out`);
          this.loadAttendance();
        },
        error: err => this.showAlert('error', 'Error', err?.error?.message ?? 'Punch-out failed')
      });
  }

  /** LOAD EMPLOYEE TODAY ATTENDANCE **/
  loadAttendance(): void {
    this.http.get<any[]>(`${this.apiUrl}/today/${this.empId}`)
      .subscribe({
        next: res => {
          this.attendanceList = res ?? [];

          const activeSession = this.attendanceList.find(session => !session.logOut);

          if (activeSession) {
            this.punchInDisabled = true;
            this.punchOutDisabled = false;
          } 
          else {
            this.punchInDisabled = false;
            this.punchOutDisabled = true;
          }

          this.cdr.detectChanges();
          setTimeout(() => this.loadAttendance(), 300);
        },
        error: err => {
          console.error('Attendance load failed', err);
          this.attendanceList = [];
        }
      });
  }

  /** LOAD EMPLOYEE OVERALL ATTENDANCE **/
  loadAllAttendance(): void {
    this.http.get<any[]>(`${this.apiUrl}/all/${this.empId}`)
      .subscribe({
        next: res => {
          this.allAttendance = res ?? [];
          this.cdr.detectChanges();
          setTimeout(() => this.loadAllAttendance(), 300);
        },
        error: err => {
          console.error('Attendance Load Failed', err);
          this.allAttendance = [];
        }
      });
  }

  /** LOAD TODAY PRESENTIES LIST**/
  loadToday(): void{
    this.http.get<any[]>(`${this.apiUrl}/today-list/${this.empId}`)
    .subscribe({
      next: res => {
        this.todayPresent = res ?? [];
        this.cdr.detectChanges();
        setTimeout(() => this.loadToday(), 300);
      },
      error: err =>{
        console.error('Presenties Load Error', err);
        this.todayPresent = [];
      }
    })
  }

  /** LOAD EMPLOYEE SHIFT DETAILS **/
  loadShift(): void {
    this.http.get<any[]>(`${this.apiUrl}/shift/${this.empId}`)
      .subscribe({
        next: res => {
          this.employeeShift = res ?? [];
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Shift Load Failed', err);
          this.employeeShift = [];
        }
      });
  }

  // Changing table based on user selection //
  changeTable(table: string) {
    this.selectedTable = table;
  }
  
  //*** MENU BAR ***//
  isCollapsed = true;
  hideMenu = false;

  toggleMenu() { this.isCollapsed = !this.isCollapsed; }

  dash() { this.router.navigate(['dashboard']); }
  NewReg() { this.router.navigate(['regform']); }
  ForPass() { this.router.navigate(['forgetform']); }
  userData() { this.router.navigate(['dataform']); }

  logOut() {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then(result => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        this.router.navigate(['login']);
      }
    });
  }
  Exit() {
    Swal.fire({
      title: 'Exit',
      text: 'Are you sure you want to exit?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    })
    .then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['login']);
      }
    });
  }
}