import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Libro } from '../models/libro.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class LibroService {

  private readonly apiUrl = 'http://localhost:8080/api/libros';

  constructor(private http: HttpClient) {}

  listar(
    page: number,
    size: number,
    sort: string,
    direction: string,
    filterField?: string,
    filterOperator?: string,
    filterValue?: string
  ): Observable<Page<Libro>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `${sort},${direction}`);

    if (filterField && filterValue) {
      params = params
        .set('filterField', filterField)
        .set('filterOperator', filterOperator ?? 'contains')
        .set('filterValue', filterValue);
    }

    return this.http
      .get<Page<Libro>>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  crear(libro: Libro): Observable<Libro> {
    return this.http
      .post<Libro>(this.apiUrl, libro)
      .pipe(catchError(this.handleError));
  }

  actualizar(id: number, libro: Libro): Observable<Libro> {
    return this.http
      .put<Libro>(`${this.apiUrl}/${id}`, libro)
      .pipe(catchError(this.handleError));
  }

  eliminar(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error HTTP', error);
    return throwError(() => error);
  }
}
