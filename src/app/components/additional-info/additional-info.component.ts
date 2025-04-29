// additional-info.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HostelService } from '../../services/hostel.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-additional-info',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.css']
})
export class AdditionalInfoComponent implements OnInit, OnDestroy {
  @Input() hostelInfo: any;
  @Input() isLoggedIn: boolean = false;
  
  editingScheduleField: string | null = null;
  editingRuleIndex: number | null = null;
  editingNoteIndex: number | null = null;
  isAddingNewNote = false;
  isAddingNewRule = false;
  tempValue: any;
  editingRuleValue: string = '';

  private subscription: Subscription = Subscription.EMPTY;

  constructor(
    private hostelService: HostelService,
    private authService: AuthService
  ) {

    
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.loadHostelInfo();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  async loadHostelInfo() {
    try {
      this.hostelInfo = await this.hostelService.getHostelInfo();
      this.hostelInfo.rules = this.hostelInfo.rules || []; // Asegurar que sea array
    } catch (error) {
      console.error('Error loading hostel info:', error);
    }
  }
  async deleteRule(index: number) {
    if (!this.hostelInfo?.id || index === null) return;
  
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (!confirmResult.isConfirmed) return;
  
    const updatedRules = [...this.hostelInfo.rules];
    updatedRules.splice(index, 1);
  
    await this.handleSaveOperation(
      async () => {
        await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
          rules: updatedRules
        });
        this.hostelInfo.rules = updatedRules;
        Swal.fire(
          'Eliminado!',
          'La regla ha sido eliminada.',
          'success'
        );
      },
      'Regla eliminada correctamente'
    );
  }
  async deleteNote(index: number) {
    if (!this.hostelInfo?.id || index === null) return;
  
    const confirmResult = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  
    if (!confirmResult.isConfirmed) return;
  
    const updatedNotes = [...this.hostelInfo.notes];
    updatedNotes.splice(index, 1);
  
    await this.handleSaveOperation(
      async () => {
        await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
          notes: updatedNotes
        });
        this.hostelInfo.notes = updatedNotes;
        Swal.fire(
          'Eliminado!',
          'La nota ha sido eliminada.',
          'success'
        );
      },
      'Nota eliminada correctamente'
    );
  }
  
  private async handleSaveOperation(
    operation: () => Promise<void>,
    successMessage: string
  ) {
    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      timer: 30000
    });

    try {
      await operation();
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Configuración guardada',
        text: successMessage,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        background: '#f0f9f0'
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.close();
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo guardar el cambio',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      background: '#f8d7da'
    });
  }

  // Schedule methods
  startEditingSchedule(field: string) {
    this.editingScheduleField = field;
    this.tempValue = this.getNestedValue(this.hostelInfo.schedule, field);
  }

  async saveScheduleField(field: string) {
    if (!this.hostelInfo?.id) return;

    const updatedSchedule = { ...this.hostelInfo.schedule };
    this.setNestedValue(updatedSchedule, field, this.tempValue);

    await this.handleSaveOperation(
      async () => {
        await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
          schedule: updatedSchedule
        });
        this.hostelInfo.schedule = updatedSchedule;
        this.resetEditingState();
      },
      'Horario actualizado correctamente'
    );
  }

  resetEditingState() {
    this.editingScheduleField = null;
    this.tempValue = null;
  }

  // Rule methods
  startEditingRule(index: number, rule: string) {
    this.editingRuleIndex = index;
    this.editingRuleValue = rule;
  }

  async updateRule(index: number) {
    if (!this.hostelInfo?.id || index === null) return;

    const updatedRules = [...this.hostelInfo.rules];
    updatedRules[index] = this.editingRuleValue.trim();

    await this.handleSaveOperation(
      async () => {
        await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
          rules: updatedRules
        });
        this.hostelInfo.rules = updatedRules;
        this.cancelRuleEdit();
      },
      'Regla actualizada correctamente'
    );
  }

  startAddingNewRule() {
    this.isAddingNewRule = true;
    this.tempValue = '';
  }

  async saveNewRule() {
    if (!this.hostelInfo?.id || !this.tempValue?.trim()) return;

    const updatedRules = [...this.hostelInfo.rules, this.tempValue.trim()];

    await this.handleSaveOperation(
      async () => {
        await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
          rules: updatedRules
        });
        this.hostelInfo.rules = updatedRules;
        this.cancelAddingNewRule();
      },
      'Nueva regla agregada correctamente'
    );
  }

  // Note methods
  startEditingNote(index: number, note: string) {
    this.editingNoteIndex = index;
    this.tempValue = note;
  }

  async updateNote(index: number) {
    if (index === null || !this.hostelInfo?.notes || !this.tempValue) return;

    const updatedNotes = [...this.hostelInfo.notes];
    updatedNotes[index] = this.tempValue.trim();

    await this.handleSaveOperation(
      async () => {
        await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
          notes: updatedNotes
        });
        this.hostelInfo.notes = updatedNotes;
        this.cancelNoteEdit();
      },
      'Nota actualizada correctamente'
    );
  }

  startAddingNewNote() {
    this.isAddingNewNote = true;
    this.tempValue = '';
  }

  async saveNewNote() {
    if (!this.hostelInfo?.id || !this.tempValue?.trim()) return;

    const updatedNotes = [...this.hostelInfo.notes, this.tempValue.trim()];

    await this.handleSaveOperation(
      async () => {
        await this.hostelService.updateHostelInfo(this.hostelInfo.id, {
          notes: updatedNotes
        });
        this.hostelInfo.notes = updatedNotes;
        this.cancelAddingNewNote();
      },
      'Nueva nota agregada correctamente'
    );
  }

  cancelAddingNewNote() {
    this.isAddingNewNote = false;
    this.tempValue = null;
  }

  // Helper methods
  private getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  private setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  cancelRuleEdit() {
    this.editingRuleIndex = null;
    this.editingRuleValue = '';
  }

  cancelNoteEdit() {
    this.editingNoteIndex = null;
    this.tempValue = null;
  }

  cancelAddingNewRule() {
    this.isAddingNewRule = false;
    this.tempValue = null;
  }
}