import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  isEditing = false;
  editingId: number | null = null;

  form = {
    title: '',
    description: '',
    date: '',
    audience: 'ALL',     // ALL | CLASS
    className: '',
    division: '',
    createdBy: 'Admin',
  };

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.api.getAdminEvents().subscribe({
      next: (res: any) => {
        console.log('Events API Response:', res);

        // Handle response - API now returns array directly
        if (Array.isArray(res)) {
          this.events = res;
        } else if (res?.events && Array.isArray(res.events)) {
          this.events = res.events;
        } else {
          this.events = [];
        }
        console.log('Events loaded:', this.events);
      },
      error: (e) => console.error('events load error', e),
    });
  }

  resetForm() {
    this.isEditing = false;
    this.editingId = null;
    this.form = {
      title: '',
      description: '',
      date: '',
      audience: 'ALL',
      className: '',
      division: '',
      createdBy: 'Admin',
    };
  }

  save() {
    const payload = { ...this.form };
    if (this.isEditing && this.editingId) {
      this.api.updateEvent(this.editingId, payload).subscribe({
        next: () => { this.resetForm(); this.load(); },
        error: (e) => console.error('update event error', e),
      });
    } else {
      this.api.createEvent(payload).subscribe({
        next: () => { this.resetForm(); this.load(); },
        error: (e) => console.error('create event error', e),
      });
    }
  }

  edit(ev: any) {
    this.isEditing = true;
    this.editingId = ev.id;
    this.form = {
      title: ev.title,
      description: ev.description || '',
      date: ev.date,
      audience: ev.audience,
      className: ev.className || '',
      division: ev.division || '',
      createdBy: ev.createdBy || 'Admin',
    };
  }

  remove(ev: any) {
    if (!confirm('Delete this event?')) return;
    this.api.deleteEvent(ev.id).subscribe({
      next: () => this.load(),
      error: (e) => console.error('delete event error', e),
    });
  }
}
