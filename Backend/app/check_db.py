from storage import listar_listados

l = listar_listados()
print(f"Total listados en BD: {len(l)}")
for x in l:
    print(f"  ID {x['id']}: {x['nombre']} ({x['afiliados_count']} afiliados)")
    print(f"      Creado: {x['creado_en']}")
