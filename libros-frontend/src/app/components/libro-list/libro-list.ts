import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibroService } from '../../services/libro';

/* ================= TIPOS ================= */
type LibroFilterField =
  | 'nombre'
  | 'autor'
  | 'fechaPublicacion'
  | 'numeroEjemplares'
  | 'costo';

@Component({
  selector: 'app-libro-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libro-list.html',
  styleUrls: ['./libro-list.css'],
})
export class LibroListComponent {

  /* ================= DATA ================= */
  libros: any[] = [];
  libroSeleccionado: any | null = null;

  /* ================= PAGINACIÓN ================= */
  page = 0;
  size = 5;
  totalPages = 0;

  /* ================= ORDENAMIENTO ================= */
  sort = 'nombre';
  direction = 'asc';

  /* ================= VISIBILIDAD FILTROS ================= */
  mostrarFiltros = true;

  /* ================= FILTROS POR COLUMNA ================= */
  filters: Record<LibroFilterField, string> = {
    nombre: '',
    autor: '',
    fechaPublicacion: '',
    numeroEjemplares: '',
    costo: ''
  };

  filterOperators: Record<LibroFilterField, string> = {
    nombre: 'contains',
    autor: 'contains',
    fechaPublicacion: 'equals',
    numeroEjemplares: 'equals',
    costo: 'equals'
  };

  /* ================= FORMULARIO ================= */
  maxFechaPublicacion = new Date().toISOString().split('T')[0];

  mostrarModalFormulario = false;
  mostrarModalEliminar = false;
  modoEdicion = false;

  constructor(
    private libroService: LibroService,
    private cdr: ChangeDetectorRef
  ) {
    this.cargarLibros();
  }

  /* ================= LISTADO ================= */
  cargarLibros(): void {

    // 🔴 RESET UI (EVITA BUGS DE CRUD)
    this.libroSeleccionado = null;
    this.mostrarModalEliminar = false;
    this.mostrarModalFormulario = false;

    const activeFilter = (Object.keys(this.filters) as LibroFilterField[])
      .find(field => this.filters[field] !== '');

    let field: LibroFilterField | '' = '';
    let operator = '';
    let value = '';

    if (activeFilter) {
      field = activeFilter;
      operator = this.filterOperators[activeFilter];
      value = this.filters[activeFilter];
    }

    this.libroService.listar(
      this.page,
      this.size,
      this.sort,
      this.direction,
      field,
      operator,
      value
    ).subscribe(resp => {
      this.libros = resp.content ?? [];
      this.totalPages = resp.totalPages ?? 0;
      this.cdr.detectChanges();
    });
  }

  /* ================= ORDEN ================= */
  ordenar(columna: string): void {
    this.direction =
      this.sort === columna && this.direction === 'asc'
        ? 'desc'
        : 'asc';

    this.sort = columna;
    this.cargarLibros();
  }

  /* ================= PAGINACIÓN ================= */
  anterior(): void {
    if (this.page > 0) {
      this.page--;
      this.cargarLibros();
    }
  }

  siguiente(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.cargarLibros();
    }
  }

  /* ================= FILTROS ================= */
  aplicarFiltros(): void {
    this.page = 0;
    this.cargarLibros();
  }

  limpiarFiltros(): void {
    (Object.keys(this.filters) as LibroFilterField[])
      .forEach(key => this.filters[key] = '');

    this.page = 0;
    this.cargarLibros();
  }

  /* ================= MODAL DESCRIPCIÓN ================= */
  abrirDescripcion(libro: any): void {
    this.libroSeleccionado = libro;
  }

  cerrarDescripcion(): void {
    this.libroSeleccionado = null;
  }

  /* ================= CRUD ================= */
  abrirCrear(): void {
    this.modoEdicion = false;
    this.libroSeleccionado = {
      nombre: '',
      autor: '',
      descripcion: '',
      fechaPublicacion: '',
      numeroEjemplares: 0,
      costo: 0
    };
    this.mostrarModalFormulario = true;
  }

  abrirEditar(libro: any): void {
    this.modoEdicion = true;
    this.libroSeleccionado = { ...libro };
    this.mostrarModalFormulario = true;
  }

  formularioValido(): boolean {
    return !!(
      this.libroSeleccionado?.nombre &&
      this.libroSeleccionado?.autor &&
      this.libroSeleccionado?.descripcion &&
      this.libroSeleccionado?.fechaPublicacion &&
      this.libroSeleccionado?.numeroEjemplares >= 0 &&
      this.libroSeleccionado?.costo >= 0
    );
  }

  guardarLibro(): void {
    if (!this.formularioValido()) return;

    const accion = this.modoEdicion
      ? this.libroService.actualizar(this.libroSeleccionado.id, this.libroSeleccionado)
      : this.libroService.crear(this.libroSeleccionado);

    accion.subscribe(() => {
      this.cerrarFormulario();
      this.cargarLibros();
    });
  }

  cerrarFormulario(): void {
    this.mostrarModalFormulario = false;
    this.libroSeleccionado = null;
  }

  confirmarEliminar(libro: any): void {
    this.libroSeleccionado = libro;
    this.mostrarModalEliminar = true;
  }

  eliminar(): void {
    if (!this.libroSeleccionado) return;

    this.libroService.eliminar(this.libroSeleccionado.id)
      .subscribe(() => {
        this.mostrarModalEliminar = false;
        this.libroSeleccionado = null;
        this.cargarLibros();
      });
  }

  /* ================= VALIDACIONES ================= */
  bloquearNegativos(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }
}
