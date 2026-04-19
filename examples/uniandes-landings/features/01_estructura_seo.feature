Feature: Estructura base y SEO de las Landing Pages de Programas
  Como usuario final, líder de mercadeo o prospecto,
  Quiero validar la estructura y el SEO de la landing de cada programa,
  Para garantizar que el contenido clave se ve y el SEO está en orden.

  @user1 @web @landing_programas @seo
  Scenario Outline: Validar estructura base y SEO del programa "<titulo>"
    Given Ingreso a la landing page del programa "<url>"
    Then el título SEO de la página debe contener "<titulo>"
    And la página debe mostrar el título principal "<titulo>"
    And los breadcrumbs deben ser correctos
    And la sección de Información Clave debe mostrar los datos generales
    And la sección de Fechas Importantes debe estar visible
    And la sección de Programas de tu interés debe mostrar tarjetas adicionales

    Examples:
      | url                                                           | titulo                     |
      | <LANDING_BASE_URL>/es/programas/medicina                      | Medicina                   |
      | <LANDING_BASE_URL>/es/programas/administracion-de-empresas    | Administración de Empresas |
      | <LANDING_BASE_URL>/es/programas/ciencia-de-datos              | Ciencia de Datos           |
