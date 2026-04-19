Feature: Validación negativa del formulario de inscripción
  Como sistema,
  Quiero bloquear el envío del formulario cuando faltan campos obligatorios,
  Para no aceptar leads incompletos.

  @user1 @web @landing_programas @form_negativo
  Scenario Outline: Validar errores de campos obligatorios en el formulario de "<titulo>"
    Given Ingreso a la landing page del programa "<url>"
    When intento enviar el formulario de pregrado estando vacío
    Then el sistema debe resaltar los campos obligatorios pidiendo ser rellenados

    Examples:
      | url                                                           | titulo                     |
      | <LANDING_BASE_URL>/es/programas/medicina                      | Medicina                   |
      | <LANDING_BASE_URL>/es/programas/administracion-de-empresas    | Administración de Empresas |
      | <LANDING_BASE_URL>/es/programas/ciencia-de-datos              | Ciencia de Datos           |
