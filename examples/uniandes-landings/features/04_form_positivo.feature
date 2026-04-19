Feature: Envío exitoso del formulario de inscripción (E2E)
  Como prospecto,
  Quiero completar el formulario de pregrado y enviarlo,
  Para recibir la confirmación de registro.

  @user1 @web @landing_programas @form_positivo
  Scenario Outline: Validar envío exitoso del formulario de pregrado - "<titulo>"
    Given Ingreso a la landing page del programa "<url>"
    When diligencio el formulario de programa pregrado en la landing y lo registro
    Then la página debería redireccionarme a la thankyou page "thank-you-page-programas"

    Examples:
      | url                                                           | titulo                     |
      | <LANDING_BASE_URL>/es/programas/medicina                      | Medicina                   |
      | <LANDING_BASE_URL>/es/programas/administracion-de-empresas    | Administración de Empresas |
      | <LANDING_BASE_URL>/es/programas/ciencia-de-datos              | Ciencia de Datos           |
