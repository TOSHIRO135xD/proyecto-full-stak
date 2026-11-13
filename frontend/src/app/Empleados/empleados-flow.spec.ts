import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { Agregar } from './agregar/agregar';
import { ListaComponent } from './lista/lista';
import { Actualizar } from './actualizar/actualizar';

describe('Flujo de empleados', () => {
  let http: HttpTestingController;
  const url = 'http://localhost:8000/api/empleados/';
  const payload = { nombre: 'Ana', apellido: 'Perez', email: 'ana@example.com', edad: 30, salario: 2500, horas: 40 };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([
        { path: 'agregar', component: Agregar },
        { path: 'empleados', component: ListaComponent },
        { path: 'actualizar/:id', component: Actualizar },
      ])],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  async function formulario() {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/agregar', Agregar);
    component.empleado = { ...payload };
    harness.detectChanges();
    await harness.fixture.whenStable();
    const form = harness.routeDebugElement!.query(By.directive(NgForm)).injector.get(NgForm);
    return { harness, component, form };
  }

  it('envía email, evita duplicados, vuelve a la lista y muestra el registro', async () => {
    const { harness, component, form } = await formulario();
    expect(form.valid).toBe(true);
    component.onSubmit(form);
    component.onSubmit(form);
    const request = http.expectOne(url);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 42, ...payload });
    await harness.fixture.whenStable();
    http.expectOne(url).flush([{ id: 42, ...payload }]);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('ana@example.com');
    expect(harness.routeNativeElement!.textContent).toContain('Ana');
  });

  it('rechaza email inválido y permite reintentar después de un error de conexión', async () => {
    const { harness, component, form } = await formulario();
    component.empleado.email = 'incorrecto';
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(form.invalid).toBe(true);
    component.onSubmit(form);
    http.expectNone(url);
    component.empleado.email = payload.email;
    harness.detectChanges();
    await harness.fixture.whenStable();
    component.onSubmit(form);
    http.expectOne(url).error(new ProgressEvent('error'));
    harness.detectChanges();
    expect(component.guardando()).toBe(false);
    expect(harness.routeNativeElement!.textContent).toContain('No se pudo conectar');
  });

  it('muestra errores de la lista y permite recargar', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/empleados', ListaComponent);
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server error' });
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('500');
    component.cargar();
    http.expectOne(url).flush([]);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('No hay empleados registrados');
  });

  it('carga un empleado, guarda sus cambios y vuelve a la lista', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/actualizar/42', Actualizar);
    http.expectOne(`${url}42/`).flush({ id: 42, ...payload });
    harness.detectChanges();
    await harness.fixture.whenStable();
    component.empleado.nombre = 'Maria';
    harness.detectChanges();
    await harness.fixture.whenStable();
    const form = harness.routeDebugElement!.query(By.directive(NgForm)).injector.get(NgForm);
    component.onSubmit(form);
    component.onSubmit(form);
    const request = http.expectOne(`${url}42/`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body.nombre).toBe('Maria');
    request.flush({ id: 42, ...payload, nombre: 'Maria' });
    await harness.fixture.whenStable();
    http.expectOne(url).flush([{ id: 42, ...payload, nombre: 'Maria' }]);
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Maria');
  });

  it('mantiene el registro si se cancela y lo quita después de eliminar', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/empleados', ListaComponent);
    http.expectOne(url).flush([{ id: 42, ...payload }]);
    const originalConfirm = window.confirm;
    try {
      window.confirm = () => false;
      component.eliminar(42);
      http.expectNone(`${url}42/`);
      expect(component.empleados().length).toBe(1);
      window.confirm = () => true;
      component.eliminar(42);
      component.eliminar(42);
      const request = http.expectOne(`${url}42/`);
      expect(request.request.method).toBe('DELETE');
      request.flush(null, { status: 204, statusText: 'No Content' });
      harness.detectChanges();
      expect(harness.routeNativeElement!.textContent).toContain('No hay empleados registrados');
    } finally {
      window.confirm = originalConfirm;
    }
  });
});
