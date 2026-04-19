Feature: Navegación por pestañas de la Landing de Programa
  Como prospecto,
  Quiero navegar entre pestañas internas del programa,
  Para revisar perfil de egresado y apoyo financiero.

  @user1 @web @landing_programas @tabs
  Scenario Outline: Validar navegación por pestañas internas del programa "<titulo>"
    Given Ingreso a la landing page del programa "<url>"
    When hago clic en la pestaña "Perfil de egresado"
    Then el contenido de "Perfil del egresado" debe volverse visible o enfocado
    When hago clic en la pestaña "Becas y apoyo financiero"
    Then el contenido de "Apoyo financiero" debe volverse visible o enfocado

    Examples:
      | url                                                           | titulo                     |
      | <LANDING_BASE_URL>/es/programas/medicina                      | Medicina                   |
      | <LANDING_BASE_URL>/es/programas/administracion-de-empresas    | Administración de Empresas |
      | <LANDING_BASE_URL>/es/programas/ciencia-de-datos              | Ciencia de Datos           |
