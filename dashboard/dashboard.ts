import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component,Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  
  allAttendance: any[] = [];
  overallStatus: string = 'N/A';

  empId!: number;
  Name = 'Employee';
  profileImage = 'assets/images/User.png';

  userUrl = 'http://localhost:5216/api/log';
  attendanceUrl = 'http://localhost:5216/api/attendance/today';

  constructor(private router: Router, private http: HttpClient, 
              private cdr: ChangeDetectorRef, @Inject (PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)) {
        const id = sessionStorage.getItem('empId');
        this.empId = id ? Number(id) : NaN;
      }
      if (!this.empId || isNaN(this.empId)) {
        this.router.navigate(['login']);
        return;   
      }
      
      this.loadUser();
      this.loadAttendance();
    }

  /* SHOW ALERT POP UP */
    showAlert(icon: 'success' | 'error' | 'warning' | 'info' | 'question', title: string, message: string) {
        const safeMessage = message.replace(/'/g, "\\'");
        Swal.fire({
          icon: icon,
          title: title,
          html: message.replace(/\n/g, '<br>'),
          timer: 2000,
          showConfirmButton: false
        });
      }
    
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
  
  loadAttendance(): void {
    this.http.get<any[]>(`${this.attendanceUrl}/${this.empId}`)
      .subscribe({
        next: res => {
          console.log("Attendance:", res);
          this.allAttendance = res;
          if (res.length > 0) {
            this.overallStatus = res[0].status;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.allAttendance = [];
          this.overallStatus = 'N/A';
        }
      });
  }
    bill(){this.router.navigate(['billform']);}
    newReg(){this.router.navigate(['regform']);}
    forPass(){this.router.navigate(['forgetform']);}
    userData(){this.router.navigate(['dataform']);}
    attendance(){this.router.navigate(['attendance']);}
    logOut() {
        Swal.fire({
          title: 'Logout',
          text: 'Are you sure you want to logout?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then(result => {
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
        }).then(result => {
          if (result.isConfirmed) {
            this.router.navigate(['login']);
          }
        });
      }
}
